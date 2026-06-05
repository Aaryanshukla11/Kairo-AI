import { CleanedSample } from '../datasetCleaning/cleaningTypes';
import { Fingerprint, DeduplicationConfig, DuplicateCluster } from './deduplicationTypes';
import { fingerprintGenerator } from './fingerprintGenerator';
import { similarityEngine } from './similarityEngine';
import { clusterManager } from './clusterManager';
import { duplicateResolver } from './duplicateResolver';

export interface ScanResult {
  fingerprints: Map<string, Fingerprint>;
  clusters: DuplicateCluster[];
  exactCount: number;
  structCount: number;
  semanticCount: number;
}

export class DuplicateDetector {
  public detectDuplicates(
    samples: CleanedSample[],
    config: DeduplicationConfig
  ): ScanResult {
    clusterManager.clear();
    const fingerprints = new Map<string, Fingerprint>();
    
    // 1. Generate fingerprints
    for (const sample of samples) {
      const fp = fingerprintGenerator.generateFingerprint(sample);
      fingerprints.set(sample.provenance?.sampleId || sample.filePath, fp);
    }

    const visited = new Set<string>();
    const clusters: DuplicateCluster[] = [];

    let exactCount = 0;
    let structCount = 0;
    let semanticCount = 0;

    // 2. Perform pairs matching and grouping
    for (let i = 0; i < samples.length; i++) {
      const sampleA = samples[i];
      const idA = sampleA.provenance?.sampleId || sampleA.filePath;

      if (visited.has(idA)) {
        continue;
      }

      visited.add(idA);
      const fpA = fingerprints.get(idA)!;
      const duplicates: CleanedSample[] = [];
      const similarities: Record<string, number> = {};

      for (let j = i + 1; j < samples.length; j++) {
        const sampleB = samples[j];
        const idB = sampleB.provenance?.sampleId || sampleB.filePath;

        if (visited.has(idB)) {
          continue;
        }

        const fpB = fingerprints.get(idB)!;
        const res = similarityEngine.evaluateSimilarity(fpA, fpB, config);

        if (res.isDuplicate) {
          visited.add(idB);
          duplicates.push(sampleB);
          similarities[idB] = res.similarityScore;

          if (res.matchType === 'exact') exactCount++;
          else if (res.matchType === 'structural') structCount++;
          else if (res.matchType === 'semantic') semanticCount++;
        }
      }

      if (duplicates.length > 0) {
        // Create initial cluster
        const clusterId = `CL-${Date.now()}-${clusters.length}`;
        const rawCluster = clusterManager.createCluster(clusterId, sampleA, duplicates, similarities);
        
        // Resolve representative candidate
        const resolved = duplicateResolver.resolveDuplicates(rawCluster);
        clusters.push(resolved);
      }
    }

    return {
      fingerprints,
      clusters,
      exactCount,
      structCount,
      semanticCount
    };
  }
}

export const duplicateDetector = new DuplicateDetector();
export default duplicateDetector;
