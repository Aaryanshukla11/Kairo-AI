import * as assert from 'assert';
import { datasetDeduplicationEngine } from '../../src/core/datasetDeduplication/datasetDeduplicationEngine';
import { hashingEngine } from '../../src/core/datasetDeduplication/hashingEngine';
import { fingerprintGenerator } from '../../src/core/datasetDeduplication/fingerprintGenerator';
import { exactMatchDetector } from '../../src/core/datasetDeduplication/exactMatchDetector';
import { structuralSimilarity } from '../../src/core/datasetDeduplication/structuralSimilarity';
import { semanticSimilarity } from '../../src/core/datasetDeduplication/semanticSimilarity';
import { similarityEngine } from '../../src/core/datasetDeduplication/similarityEngine';
import { duplicateResolver } from '../../src/core/datasetDeduplication/duplicateResolver';
import { clusterManager } from '../../src/core/datasetDeduplication/clusterManager';
import { duplicateDetector } from '../../src/core/datasetDeduplication/duplicateDetector';
import { sourceCodeProvider, markdownProvider, jsonProvider } from '../../src/core/datasetDeduplication/providers';

describe('Dataset Deduplication Engine Unit Tests', () => {
  beforeEach(() => {
    datasetDeduplicationEngine.clearHistory();
  });

  describe('Hashing Engine', () => {
    it('should compute matching SHA-256 exact hashes', () => {
      const h1 = hashingEngine.computeExactHash('console.log("test");');
      const h2 = hashingEngine.computeExactHash('console.log("test");');
      assert.strictEqual(h1, h2);
    });

    it('should compute structural hashes from tokens list', () => {
      const hash = hashingEngine.computeStructuralHash(['IDENT', 'IDENT', 'const']);
      assert.ok(hash.length > 0);
    });
  });

  describe('Providers Preprocessors', () => {
    it('should strip comments and normalize syntax in code cleaner', () => {
      const code = 'const x = 10; // inline comment\n/* block */\nlet y = 20;';
      const norm = sourceCodeProvider.normalizeIdentifiers(code);
      assert.ok(!norm.includes('comment'));
      assert.ok(norm.includes('IDENT'));
    });

    it('should clean elements in JSON preprocessor', () => {
      const json = '{"b": 2, "a": 1}';
      const norm = jsonProvider.normalizeJson(json);
      assert.strictEqual(norm, '{"a":1,"b":2}');
    });

    it('should strip syntax marks in markdown provider', () => {
      const md = '# Header\n[Link](url)\n**bold**';
      const norm = markdownProvider.normalizeMarkdown(md);
      assert.ok(!norm.includes('#'));
      assert.ok(norm.includes('link'));
    });
  });

  describe('Fingerprint Generator', () => {
    it('should shingle tokens and construct MinHash array signature', () => {
      const sample: any = {
        filePath: 'main.ts',
        content: 'const x = 10; let y = 20; console.log(x + y);'
      };
      const fp = fingerprintGenerator.generateFingerprint(sample, 2, 10);
      assert.strictEqual(fp.minHashes.length, 10);
      assert.ok(fp.exactHash.length > 0);
      assert.ok(fp.structuralHash.length > 0);
    });
  });

  describe('Similarity Engine Matching algorithms', () => {
    it('should identify exact duplicate matches', () => {
      const f1: any = { exactHash: 'abc', structuralHash: 'def', minHashes: [1, 2] };
      const f2: any = { exactHash: 'abc', structuralHash: 'xyz', minHashes: [4, 5] };
      assert.strictEqual(exactMatchDetector.isExactMatch(f1, f2), true);
    });

    it('should evaluate MinHash Jaccard semantic overlap ratios', () => {
      const f1: any = { minHashes: [1, 2, 3, 4, 5] };
      const f2: any = { minHashes: [1, 2, 3, 9, 9] };
      const similarity = semanticSimilarity.computeSemanticSimilarity(f1, f2);
      assert.strictEqual(similarity, 0.6);
    });

    it('should match candidates crossing threshold boundaries', () => {
      const f1: any = { exactHash: 'a', structuralHash: 'b', minHashes: [1, 2, 3] };
      const f2: any = { exactHash: 'x', structuralHash: 'b', minHashes: [1, 2, 9] };
      const config = { exactMatchThreshold: 1.0, structuralThreshold: 0.90, semanticThreshold: 0.60 };

      const res = similarityEngine.evaluateSimilarity(f1, f2, config);
      assert.strictEqual(res.isDuplicate, true);
      assert.strictEqual(res.matchType, 'structural'); // structural threshold (same hash) is evaluated first
    });
  });

  describe('Duplicate Resolver Rules', () => {
    it('should rank samples and select the best representative candidate', () => {
      const repSample: any = {
        filePath: 'a.ts',
        qualityScore: 70,
        provenance: { sampleId: 's1', datasetId: 'ds', collectionTime: 100, branch: 'main' }
      };
      const dupSample: any = {
        filePath: 'b.ts',
        qualityScore: 90, // higher score should be preferred
        provenance: { sampleId: 's2', datasetId: 'ds', collectionTime: 200, branch: 'main' }
      };

      const cluster: any = {
        clusterId: 'cl-1',
        representativeSample: repSample,
        duplicateSamples: [dupSample],
        similarityScores: { 's2': 1.0 },
        languages: ['ts'],
        qualityScores: { 's1': 70, 's2': 90 },
        provenance: { 's1': repSample.provenance, 's2': dupSample.provenance }
      };

      const resolved = duplicateResolver.resolveDuplicates(cluster);
      assert.strictEqual(resolved.representativeSample.provenance?.sampleId, 's2');
      assert.strictEqual(resolved.duplicateSamples[0].provenance?.sampleId, 's1');
    });
  });

  describe('Deduplication Engine Pipeline End-to-End', () => {
    it('should complete run, emit event logs, and save duplicate details', () => {
      const samples: any[] = [
        {
          filePath: 'file1.ts',
          content: 'const x = 10; console.log(x);',
          cleanedSizeBytes: 30,
          qualityScore: 80,
          provenance: { sampleId: 's1', datasetId: 'ds', filePath: 'file1.ts', checksum: 'sha1', language: 'ts', license: 'MIT' }
        },
        {
          filePath: 'file2.ts',
          content: 'const x = 10; console.log(x);', // exact copy of file1
          cleanedSizeBytes: 30,
          qualityScore: 70,
          provenance: { sampleId: 's2', datasetId: 'ds', filePath: 'file2.ts', checksum: 'sha1', language: 'ts', license: 'MIT' }
        },
        {
          filePath: 'file3.py',
          content: 'print("unique script")',
          cleanedSizeBytes: 22,
          qualityScore: 90,
          provenance: { sampleId: 's3', datasetId: 'ds', filePath: 'file3.py', checksum: 'sha3', language: 'py', license: 'MIT' }
        }
      ];

      const events: string[] = [];
      const unsubscribe = datasetDeduplicationEngine.subscribe(e => {
        events.push(e.type);
      });

      const res = datasetDeduplicationEngine.deduplicateDataset('ds', samples);

      // Verify outputs
      assert.strictEqual(res.deduplicatedDataset.length, 2); // file2 copy removed
      assert.strictEqual(res.clusters.length, 1);
      assert.strictEqual(res.report.duplicatesFound, 1);
      assert.strictEqual(res.report.spaceSavedBytes, 30);

      // Verify representative selected (s1 is higher quality than s2)
      assert.strictEqual(res.clusters[0].representativeSample.provenance?.sampleId, 's1');
      assert.strictEqual(res.clusters[0].duplicateSamples[0].provenance?.sampleId, 's2');

      // Check events
      assert.ok(events.includes('DeduplicationStarted'));
      assert.ok(events.includes('FingerprintsGenerated'));
      assert.ok(events.includes('DuplicatesResolved'));
      assert.ok(events.includes('DeduplicationCompleted'));

      unsubscribe();
    });
  });
});
