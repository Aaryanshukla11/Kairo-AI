import * as assert from 'assert';
import { datasetVersionManager } from '../../src/core/datasetVersioning/datasetVersionManager';
import { semanticVersioning } from '../../src/core/datasetVersioning/semanticVersioning';
import { lineageTracker } from '../../src/core/datasetVersioning/lineageTracker';
import { datasetSnapshot } from '../../src/core/datasetVersioning/datasetSnapshot';
import { versionManifest } from '../../src/core/datasetVersioning/versionManifest';
import { versionRegistry } from '../../src/core/datasetVersioning/versionRegistry';
import { versionValidator } from '../../src/core/datasetVersioning/versionValidator';
import { versionComparator } from '../../src/core/datasetVersioning/versionComparator';

describe('Dataset Version Manager Unit Tests', () => {
  beforeEach(() => {
    datasetVersionManager.clearHistory();
  });

  describe('Semantic Versioning Parser', () => {
    it('should parse major, minor, patch and validate version strings', () => {
      const parsed = semanticVersioning.parse('v1.2.3');
      assert.strictEqual(parsed.major, 1);
      assert.strictEqual(parsed.minor, 2);
      assert.strictEqual(parsed.patch, 3);

      assert.strictEqual(semanticVersioning.isValid('2.0.1'), true);
      assert.strictEqual(semanticVersioning.isValid('1.a.2'), false);
    });

    it('should increment version tags properly', () => {
      assert.strictEqual(semanticVersioning.incrementPatch('1.0.0'), '1.0.1');
      assert.strictEqual(semanticVersioning.incrementMinor('1.0.0'), '1.1.0');
      assert.strictEqual(semanticVersioning.incrementMajor('1.0.0'), '2.0.0');
    });
  });

  describe('Lineage Tracker', () => {
    it('should track parent-child relationships and output lineage nodes list', () => {
      lineageTracker.registerNode('ds1', '1.0.0', undefined, undefined, ['Collector'], ['Created']);
      lineageTracker.registerNode('ds1', '1.1.0', '1.0.0', undefined, ['Cleaning'], ['Normalized content']);

      const node1 = lineageTracker.getLineage('ds1', '1.0.0');
      const node2 = lineageTracker.getLineage('ds1', '1.1.0');

      assert.ok(node1);
      assert.strictEqual(node1.children[0], '1.1.0');
      assert.ok(node2);
      assert.strictEqual(node2.parentVersion, '1.0.0');
    });
  });

  describe('Dataset Snapshot & Version Manifests', () => {
    it('should generate snapshots and calculate matching checksum manifests', () => {
      const samples: any[] = [
        { filePath: 'a.ts', content: 'const x = 1;', provenance: { checksum: 'sha-1' } },
        { filePath: 'b.ts', content: 'const y = 2;', provenance: { checksum: 'sha-2' } }
      ];

      const snapshot = datasetSnapshot.generateSnapshot('ds', '1.0.0', samples);
      assert.strictEqual(snapshot.samples.length, 2);
      assert.ok(snapshot.checksum.startsWith('sha256-'));

      const manifest = versionManifest.createManifest('ds', '1.0.0', snapshot.checksum, samples, 100);
      assert.strictEqual(manifest.sampleCount, 2);
      assert.strictEqual(manifest.checksumsMap['a.ts'], 'sha-1');
    });
  });

  describe('Immutable Registry & Validator', () => {
    it('should register version models and throw errors on duplicated override attempts', () => {
      const model: any = {
        datasetId: 'ds1',
        version: '1.0.0',
        checksum: 'sha-x',
        sampleCount: 10,
        tokenEstimate: 100,
        languages: ['ts'],
        licenses: ['MIT']
      };

      versionRegistry.registerVersion(model);
      
      // Duplicated registry call should throw error due to immutability
      assert.throws(() => {
        versionRegistry.registerVersion(model);
      }, /already exists and is immutable/);
    });

    it('should run validate functions', () => {
      const manifest: any = {
        manifestId: 'man-1',
        datasetId: 'ds1',
        version: '1.0.0',
        checksum: 'sha-x',
        sampleCount: 10
      };

      const val = versionValidator.validateManifest(manifest);
      assert.strictEqual(val.isValid, true);
    });
  });

  describe('Version Comparator', () => {
    it('should compare models and list differences metrics', () => {
      const v1: any = {
        version: '1.0.0',
        sampleCount: 10,
        tokenEstimate: 100,
        languages: ['TypeScript'],
        checksum: 'sha-1',
        qualityMetrics: { averageQualityScore: 80 }
      };

      const v2: any = {
        version: '1.1.0',
        sampleCount: 8,
        tokenEstimate: 80,
        languages: ['TypeScript', 'Python'],
        checksum: 'sha-2',
        qualityMetrics: { averageQualityScore: 85 }
      };

      const comparison = versionComparator.compareVersions(v1, v2);
      assert.strictEqual(comparison.sampleCountDiff, -2);
      assert.strictEqual(comparison.tokenCountDiff, -20);
      assert.strictEqual(comparison.qualityScoreDiff, 5);
      assert.deepStrictEqual(comparison.languagesAdded, ['Python']);
      assert.strictEqual(comparison.checksumsMatch, false);
    });
  });

  describe('Version Engine Pipeline Ingestions', () => {
    it('should execute pipeline, build snap and update registries', () => {
      const samples: any[] = [
        {
          filePath: 'a.ts',
          content: 'console.log("main");',
          cleanedSizeBytes: 20,
          qualityScore: 80,
          provenance: { sampleId: 's1', datasetId: 'ds', filePath: 'a.ts', checksum: 'sha-1', language: 'ts', license: 'MIT' }
        }
      ];

      // Ingest v1
      const res1 = datasetVersionManager.registerNewVersion('ds', '1.0.0', samples);
      assert.strictEqual(res1.versionModel.version, '1.0.0');
      assert.strictEqual(res1.versionModel.sampleCount, 1);

      // Ingest v2 as child of v1
      const res2 = datasetVersionManager.registerNewVersion('ds', '1.1.0', samples, '1.0.0', undefined, ['Minor updates']);
      assert.strictEqual(res2.versionModel.version, '1.1.0');
      assert.strictEqual(res2.versionModel.parentVersion, '1.0.0');

      const lineage = datasetVersionManager.getLineageNode('ds', '1.1.0');
      assert.strictEqual(lineage?.parentVersion, '1.0.0');
    });
  });
});
