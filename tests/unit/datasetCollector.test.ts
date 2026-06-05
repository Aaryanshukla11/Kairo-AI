import * as assert from 'assert';
import { datasetCollector } from '../../src/core/datasetCollector/datasetCollector';
import { licenseDetector } from '../../src/core/datasetCollector/licenseDetector';
import { integrityValidator } from '../../src/core/datasetCollector/integrityValidator';
import { metadataCollector } from '../../src/core/datasetCollector/metadataCollector';
import { provenanceTracker } from '../../src/core/datasetCollector/provenanceTracker';
import { sourceDiscovery } from '../../src/core/datasetCollector/sourceDiscovery';
import { repositoryScanner } from '../../src/core/datasetCollector/repositoryScanner';
import { collectionManager } from '../../src/core/datasetCollector/collectionManager';
import {
  localFolderProvider,
  gitRepositoryProvider,
  githubArchiveProvider,
  markdownProvider,
  jsonProvider,
  documentationProvider,
  sourceCodeProvider
} from '../../src/core/datasetCollector/providers';

describe('Dataset Collector Core Unit Tests', () => {
  beforeEach(() => {
    collectionManager.clear();
  });

  describe('License Detector', () => {
    it('should detect MIT license from headers', () => {
      const content = '// Permission is hereby granted, free of charge, to any person obtaining a copy of this software... MIT License';
      assert.strictEqual(licenseDetector.detectLicense(content), 'MIT');
    });

    it('should detect Apache-2.0 license from headers', () => {
      const content = '/* Apache License Version 2.0, January 2004 http://www.apache.org/licenses/ */';
      assert.strictEqual(licenseDetector.detectLicense(content), 'Apache-2.0');
    });

    it('should detect GPL license from headers', () => {
      const content = 'GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007';
      assert.strictEqual(licenseDetector.detectLicense(content), 'GPL');
    });

    it('should detect BSD license from headers', () => {
      const content = 'Redistribution and use in source and binary forms BSD 3-Clause License';
      assert.strictEqual(licenseDetector.detectLicense(content), 'BSD');
    });

    it('should return Unknown for non-licensed source code', () => {
      const content = 'const calculateTotal = (a: number, b: number) => a + b;';
      assert.strictEqual(licenseDetector.detectLicense(content), 'Unknown');
    });
  });

  describe('Provenance Tracker', () => {
    it('should generate valid provenance record with sampleId and SHA-256 checksum', () => {
      const checksum = provenanceTracker.computeChecksum('console.log("hello world");');
      assert.ok(checksum.startsWith('sha256-'));

      const provenance = provenanceTracker.generateProvenance(
        'ds-test-01',
        'local',
        'src/index.ts',
        'TypeScript',
        'MIT',
        checksum,
        { repository: 'test-repo', commitHash: 'abc1234' }
      );

      assert.ok(provenance.sampleId.startsWith('sample-'));
      assert.strictEqual(provenance.datasetId, 'ds-test-01');
      assert.strictEqual(provenance.language, 'TypeScript');
      assert.strictEqual(provenance.license, 'MIT');
      assert.strictEqual(provenance.repository, 'test-repo');
      assert.strictEqual(provenance.commitHash, 'abc1234');
      assert.strictEqual(provenance.collectorVersion, '1.0.0');
    });

    it('should correctly infer language from file extensions', () => {
      assert.strictEqual(provenanceTracker.inferLanguageFromPath('app.py'), 'Python');
      assert.strictEqual(provenanceTracker.inferLanguageFromPath('main.rs'), 'Rust');
      assert.strictEqual(provenanceTracker.inferLanguageFromPath('data.json'), 'JSON');
      assert.strictEqual(provenanceTracker.inferLanguageFromPath('readme.md'), 'Markdown');
    });
  });

  describe('Integrity Validator', () => {
    it('should validate complete items successfully', () => {
      const mockItems: any[] = [
        {
          filePath: 'src/main.ts',
          content: 'export const x = 1;',
          sizeBytes: 19,
          provenance: {
            sampleId: 'sample-123',
            datasetId: 'ds-1',
            checksum: 'sha256-abcdef'
          }
        }
      ];

      const report = integrityValidator.validate(mockItems);
      assert.strictEqual(report.isValid, true);
      assert.strictEqual(report.errors.length, 0);
    });

    it('should flag unreadable files and missing checksums', () => {
      const mockItems: any[] = [
        {
          filePath: 'broken.ts',
          content: null,
          provenance: { checksum: '' }
        }
      ];

      const report = integrityValidator.validate(mockItems);
      assert.strictEqual(report.isValid, false);
      assert.ok(report.errors.length > 0);
    });
  });

  describe('Metadata Collector', () => {
    it('should calculate breakdown distributions and license reports', () => {
      const mockItems: any[] = [
        { filePath: 'a.ts', sizeBytes: 100, provenance: { language: 'TypeScript', license: 'MIT', sourceType: 'local' } },
        { filePath: 'b.ts', sizeBytes: 200, provenance: { language: 'TypeScript', license: 'MIT', sourceType: 'local' } },
        { filePath: 'c.py', sizeBytes: 150, provenance: { language: 'Python', license: 'Apache-2.0', sourceType: 'git' } }
      ];

      const meta = metadataCollector.collectMetadata(mockItems);
      assert.strictEqual(meta.languagesDistribution['TypeScript'], 2);
      assert.strictEqual(meta.languagesDistribution['Python'], 1);
      assert.strictEqual(meta.licensesDistribution['MIT'], 2);
      assert.strictEqual(meta.totalFiles, 3);
      assert.strictEqual(meta.totalBytes, 450);

      const licenseReport = metadataCollector.generateLicenseReport(mockItems);
      assert.strictEqual(licenseReport.permissibleCount, 3);
      assert.strictEqual(licenseReport.unknownCount, 0);
    });
  });

  describe('Source Discovery', () => {
    it('should discover and categorize paths correctly', () => {
      const paths = [
        'c:/projects/my-app',
        'github.com/kairo-ai/core.git',
        'c:/docs/readme.md',
        'c:/data/dataset.json'
      ];

      const sources = sourceDiscovery.discover(paths);
      assert.strictEqual(sources.length, 4);

      const report = sourceDiscovery.generateSourceReport(sources);
      assert.strictEqual(report.totalSources, 4);
      assert.strictEqual(report.reachableSources, 4);
    });
  });

  describe('Providers Suite', () => {
    it('should filter files using providers', () => {
      const rawFiles = [
        { path: 'src/main.ts', content: 'console.log("ts");' },
        { path: 'docs/guide.md', content: '# Guide' },
        { path: 'config/settings.json', content: '{"a": 1}' }
      ];

      const mdFiles = markdownProvider.filterMarkdownFiles(rawFiles);
      assert.strictEqual(mdFiles.length, 1);
      assert.strictEqual(mdFiles[0].path, 'docs/guide.md');

      const jsonFiles = jsonProvider.filterJsonFiles(rawFiles);
      assert.strictEqual(jsonFiles.length, 1);
      assert.strictEqual(jsonFiles[0].path, 'config/settings.json');

      const codeFiles = sourceCodeProvider.filterSourceCode(rawFiles);
      assert.strictEqual(codeFiles.length, 1);
      assert.strictEqual(codeFiles[0].path, 'src/main.ts');
    });
  });

  describe('Collector Engine Complete Pipeline', () => {
    it('should execute complete pipeline, emit events, build manifest and store collection', async () => {
      const eventsEmitted: string[] = [];
      const unsubscribe = datasetCollector.subscribe(evt => {
        eventsEmitted.push(evt.type);
      });

      const rawFiles = [
        { path: 'src/index.ts', content: '// Permission is hereby granted MIT License\nconsole.log("hello");', language: 'TypeScript' },
        { path: 'src/util.ts', content: 'export function add(a: number, b: number) { return a + b; }', language: 'TypeScript' }
      ];

      const result = await datasetCollector.collectDataset(
        'ds-core-v1',
        ['c:/workspace/src'],
        rawFiles,
        'local'
      );

      assert.strictEqual(result.files.length, 2);
      assert.strictEqual(result.manifest.datasetId, 'ds-core-v1');
      assert.strictEqual(result.manifest.totalFiles, 2);
      assert.strictEqual(result.stats.collectedFilesCount, 2);
      assert.ok(result.manifest.manifestId.startsWith('COL-MAN-'));
      assert.strictEqual(result.manifest.integrityStatus, 'valid');

      // Check stored collection
      const stored = datasetCollector.getCollection('ds-core-v1');
      assert.ok(stored);
      assert.strictEqual(stored.length, 2);

      // Verify events captured
      assert.ok(eventsEmitted.includes('SourceDiscovered'));
      assert.ok(eventsEmitted.includes('ManifestCreated'));
      assert.ok(eventsEmitted.includes('ReportPublished'));

      unsubscribe();
    });
  });
});
