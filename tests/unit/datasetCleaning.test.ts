import * as assert from 'assert';
import { datasetCleaningPipeline } from '../../src/core/datasetCleaning/datasetCleaningPipeline';
import { encodingNormalizer } from '../../src/core/datasetCleaning/encodingNormalizer';
import { whitespaceNormalizer } from '../../src/core/datasetCleaning/whitespaceNormalizer';
import { languageNormalizer } from '../../src/core/datasetCleaning/languageNormalizer';
import { metadataNormalizer } from '../../src/core/datasetCleaning/metadataNormalizer';
import { corruptionDetector } from '../../src/core/datasetCleaning/corruptionDetector';
import { invalidSampleDetector } from '../../src/core/datasetCleaning/invalidSampleDetector';
import { repairEngine } from '../../src/core/datasetCleaning/repairEngine';
import { qualityScorer } from '../../src/core/datasetCleaning/qualityScorer';
import {
  sourceCodeCleaner,
  markdownCleaner,
  jsonCleaner,
  textCleaner,
  documentationCleaner
} from '../../src/core/datasetCleaning/providers';

describe('Dataset Cleaning Pipeline Unit Tests', () => {
  beforeEach(() => {
    datasetCleaningPipeline.clearHistory();
  });

  describe('Encoding Normalizer', () => {
    it('should normalize Unicode formatting to NFC', () => {
      const content = 'Caf\u0065\u0301'; // Café decomposed
      const res = encodingNormalizer.normalizeEncoding(content);
      assert.strictEqual(res.normalized, 'Caf\u00e9'); // Café precomposed
      assert.strictEqual(res.isModified, true);
    });

    it('should detect corrupted encoding structures', () => {
      const content = 'Some text with replacement character \uFFFD and another \uFFFD in a very short string.';
      assert.strictEqual(encodingNormalizer.isCorruptedEncoding(content), true);
    });
  });

  describe('Whitespace Normalizer', () => {
    it('should normalize CRLF line endings to LF and collapse blank lines', () => {
      const content = 'line1\r\n\r\n\r\nline2 \r\n';
      const res = whitespaceNormalizer.normalizeWhitespace(content);
      assert.strictEqual(res.normalized, 'line1\n\nline2');
      assert.strictEqual(res.isModified, true);
    });
  });

  describe('Language & Metadata Normalizers', () => {
    it('should map custom language names to standardized naming schemes', () => {
      assert.strictEqual(languageNormalizer.normalizeLanguage('ts', 'main.ts').normalized, 'TypeScript');
      assert.strictEqual(languageNormalizer.normalizeLanguage('python', 'main.py').normalized, 'Python');
      assert.strictEqual(languageNormalizer.normalizeLanguage('golang', 'main.go').normalized, 'Go');
    });

    it('should clean paths and fill default metadata branch/commit hashes', () => {
      const prov: any = {
        sampleId: 'sample-1 ',
        datasetId: ' ds-1',
        filePath: 'src\\core\\index.ts',
        branch: ''
      };
      const res = metadataNormalizer.normalizeMetadata(prov);
      assert.strictEqual(res.normalized.sampleId, 'sample-1');
      assert.strictEqual(res.normalized.datasetId, 'ds-1');
      assert.strictEqual(res.normalized.filePath, 'src/core/index.ts');
      assert.strictEqual(res.normalized.branch, 'main');
    });
  });

  describe('Corruption & Invalid Sample Detectors', () => {
    it('should flag binary signatures and unclosed json constructs', () => {
      const sample: any = {
        filePath: 'test.json',
        content: '{"key": "value"',
        provenance: {}
      };
      const res = corruptionDetector.detectCorruption(sample);
      assert.strictEqual(res.isCorrupted, true);
      assert.ok(res.reasons.some(r => r.includes('JSON')));
    });

    it('should reject files based on cleaning policies', () => {
      const sample: any = {
        filePath: 'test.bin',
        content: 'some content with \x00 null byte',
        provenance: {}
      };
      const rules = {
        rejectCorrupted: true,
        rejectUnreadable: true,
        rejectUnknownEncoding: true,
        rejectMissingMetadata: true,
        rejectUnsupportedFormats: true,
        rejectEmptySamples: true
      };
      const res = invalidSampleDetector.detectInvalidSample(sample, rules);
      assert.strictEqual(res.isInvalid, true);
      assert.ok(res.reasons.length > 0);
    });
  });

  describe('Repair Engine', () => {
    it('should close unclosed braces/brackets in broken JSON files', () => {
      const sample: any = {
        filePath: 'test.json',
        content: '{"nested": [1, 2, 3',
        provenance: {}
      };
      const res = repairEngine.repairSample(sample);
      assert.strictEqual(res.repairedContent, '{"nested": [1, 2, 3]}');
      assert.ok(res.repairsApplied.includes('Closed unclosed JSON braces/brackets'));
    });
  });

  describe('Quality Scorer', () => {
    it('should assign a weighted overall quality score and breakdown', () => {
      const sample: any = {
        filePath: 'src/main.ts',
        content: 'console.log("hello");\n// Helper method\nconst x = 10;',
        provenance: {
          sampleId: 'sample-1',
          datasetId: 'ds-1',
          filePath: 'src/main.ts',
          checksum: 'sha256-abc',
          language: 'TypeScript',
          license: 'MIT'
        }
      };

      const score = qualityScorer.evaluateQuality(sample);
      assert.ok(score.overallScore >= 40);
      assert.strictEqual(score.breakdown.syntaxValidity, 100);
      assert.strictEqual(score.breakdown.metadataCompleteness, 100);
    });
  });

  describe('Cleaners Providers', () => {
    it('should format code and doc files correctly', () => {
      const tsContent = 'const x = 1;   \n';
      const cleanTs = sourceCodeCleaner.cleanSourceCode(tsContent);
      assert.strictEqual(cleanTs.content, 'const x = 1;');

      const mdContent = '#Heading\n\n\ntext';
      const cleanMd = markdownCleaner.cleanMarkdown(mdContent);
      assert.strictEqual(cleanMd.content, '# Heading\n\ntext');
    });
  });

  describe('Cleaning Pipeline End-to-End Execution', () => {
    it('should execute 9-stage pipeline, apply rules, generate reports, and log runs history', async () => {
      const collected: any[] = [
        {
          filePath: 'main.ts',
          content: 'console.log("hello");   \r\n',
          sizeBytes: 25,
          provenance: {
            sampleId: 'sample-1',
            datasetId: 'ds-1',
            filePath: 'main.ts',
            checksum: 'sha256-xyz',
            language: 'ts',
            license: 'MIT'
          }
        },
        {
          filePath: 'corrupted.bin',
          content: 'bin \x00 data',
          sizeBytes: 10,
          provenance: {
            sampleId: 'sample-2',
            datasetId: 'ds-1',
            filePath: 'corrupted.bin',
            checksum: 'sha256-abc',
            language: 'Unknown',
            license: 'Unknown'
          }
        }
      ];

      const eventsEmitted: string[] = [];
      const unsubscribe = datasetCleaningPipeline.subscribe(e => {
        eventsEmitted.push(e.type);
      });

      const result = await datasetCleaningPipeline.cleanDataset('ds-1', collected, {
        rejectCorrupted: true,
        minQualityScoreAllowed: 40
      });

      assert.strictEqual(result.cleanedSamples.length, 1);
      assert.strictEqual(result.rejectedSamples.length, 1);
      assert.strictEqual(result.report.samplesProcessed, 2);
      assert.strictEqual(result.report.acceptedCount, 1);
      assert.strictEqual(result.report.rejectedCount, 1);
      assert.strictEqual(result.report.normalizationSummary.utf8NormalizedCount, 0);

      // Verify that provenance is preserved on cleaned sample
      assert.strictEqual(result.cleanedSamples[0].provenance.sampleId, 'sample-1');
      assert.strictEqual(result.cleanedSamples[0].provenance.language, 'TypeScript');

      // Verify events captured
      assert.ok(eventsEmitted.includes('PipelineStarted'));
      assert.ok(eventsEmitted.includes('SampleValidated'));
      assert.ok(eventsEmitted.includes('CorruptionDetected'));
      assert.ok(eventsEmitted.includes('PipelineCompleted'));

      unsubscribe();
    });
  });
});
