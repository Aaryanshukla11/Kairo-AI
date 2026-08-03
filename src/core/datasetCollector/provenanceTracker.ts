import { ProvenanceModel } from './collectorTypes';
import * as crypto from 'crypto';

export class ProvenanceTracker {
  private collectorVersion = '1.0.0';

  public generateProvenance(
    datasetId: string,
    sourceType: string,
    filePath: string,
    language: string,
    license: string,
    checksum: string,
    extra?: {
      repository?: string;
      repositoryUrl?: string;
      commitHash?: string;
      branch?: string;
    }
  ): ProvenanceModel {
    const timeStr = Date.now().toString();
    const hashSeed = `${datasetId}:${filePath}:${timeStr}`;
    const sampleHash = crypto.createHash('md5').update(hashSeed).digest('hex').substring(0, 12);
    const sampleId = `sample-${sampleHash}`;

    return {
      sampleId,
      datasetId,
      sourceType,
      repository: extra?.repository || 'local-workspace',
      repositoryUrl: extra?.repositoryUrl || 'file://' + filePath,
      commitHash: extra?.commitHash || 'HEAD',
      branch: extra?.branch || 'main',
      filePath,
      language: language || this.inferLanguageFromPath(filePath),
      license: license || 'Unknown',
      collectionTime: Date.now(),
      checksum,
      collectorVersion: this.collectorVersion
    };
  }

  public inferLanguageFromPath(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'TypeScript';
      case 'js':
      case 'jsx':
      case 'cjs':
      case 'mjs':
        return 'JavaScript';
      case 'py':
        return 'Python';
      case 'java':
        return 'Java';
      case 'cpp':
      case 'cc':
      case 'cxx':
      case 'h':
      case 'hpp':
        return 'C++';
      case 'c':
        return 'C';
      case 'cs':
        return 'C#';
      case 'go':
        return 'Go';
      case 'rs':
        return 'Rust';
      case 'md':
      case 'markdown':
        return 'Markdown';
      case 'json':
        return 'JSON';
      case 'html':
      case 'htm':
        return 'HTML';
      case 'css':
      case 'scss':
        return 'CSS';
      case 'sh':
      case 'bash':
        return 'Shell';
      case 'yaml':
      case 'yml':
        return 'YAML';
      case 'txt':
        return 'Text';
      default:
        return 'Unknown';
    }
  }

  public computeChecksum(content: string): string {
    return 'sha256-' + crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  }
}

export const provenanceTracker = new ProvenanceTracker();
