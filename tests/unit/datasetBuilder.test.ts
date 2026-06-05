import * as assert from 'assert';
import { datasetBuilder } from '../../src/core/datasetBuilder/datasetBuilder';
import { datasetValidator } from '../../src/core/datasetBuilder/datasetValidator';
import { datasetOrganizer } from '../../src/core/datasetBuilder/datasetOrganizer';
import { datasetMetadataGenerator } from '../../src/core/datasetBuilder/datasetMetadata';
import { datasetIndexer } from '../../src/core/datasetBuilder/datasetIndexer';
import { datasetStatisticsCalculator } from '../../src/core/datasetBuilder/datasetStatistics';
import { DatasetFileItem } from '../../src/core/datasetBuilder/datasetTypes';

describe('Dataset Builder Tests', () => {
  const mockFiles: DatasetFileItem[] = [
    { path: 'src/main.ts', content: 'console.log("hello");', sizeBytes: 21, tokenEstimate: 6, language: 'TypeScript' },
    { path: 'src/utils.js', content: 'function add(a,b) { return a+b; }', sizeBytes: 32, tokenEstimate: 8, language: 'JavaScript' }
  ];

  describe('Deduplication & Organization', () => {
    it('should group items by programming language keys', () => {
      const groups = datasetOrganizer.groupByLanguage(mockFiles);
      assert.strictEqual(groups['TypeScript'].length, 1);
      assert.strictEqual(groups['JavaScript'].length, 1);
    });
  });

  describe('Metadata Extraction', () => {
    it('should generate distribution mapping and token estimates', () => {
      const meta = datasetMetadataGenerator.generate(mockFiles);
      assert.strictEqual(meta.languageDistribution['TypeScript'], 1);
      assert.strictEqual(meta.tokenEstimate, 14);
    });
  });

  describe('Indexer', () => {
    it('should alphabetize path arrays stable-wise', () => {
      const index = datasetIndexer.buildIndex(mockFiles);
      assert.strictEqual(index[0], 'src/main.ts');
      assert.strictEqual(index[1], 'src/utils.js');
    });
  });

  describe('Validator Checklists', () => {
    it('should report warnings on unrecognized extensions', () => {
      const invalidFiles: DatasetFileItem[] = [
        { path: 'src/main.ts', content: 'ts content', sizeBytes: 10, tokenEstimate: 2, language: 'TypeScript' },
        { path: 'src/main.raw', content: 'raw content', sizeBytes: 11, tokenEstimate: 3, language: 'Raw' }
      ];

      const dummyManifest: any = { datasetId: 'd1', name: 'dname' };
      const report = datasetValidator.validate(invalidFiles, dummyManifest);
      assert.strictEqual(report.isValid, true);
      assert.strictEqual(report.warnings.length, 1);
      assert.ok(report.warnings[0].includes('Unsupported file format'));
    });
  });

  describe('Dataset Compiler Pipeline', () => {
    it('should build full dataset reports successfully', async () => {
      const result = await datasetBuilder.createDataset(
        'ds-coder',
        'Coder Dataset',
        '1.0.0',
        'localFolder',
        mockFiles,
        'TypeScript/JavaScript coder examples'
      );

      assert.strictEqual(result.dataset.manifest.name, 'Coder Dataset');
      assert.strictEqual(result.validation.isValid, true);
      assert.strictEqual(result.dataset.index.length, 2);
    });
  });
});
