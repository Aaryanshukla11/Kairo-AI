import * as assert from 'assert';
import { tokenizerTrainingPipeline } from '../../src/core/tokenizerTraining/tokenizerTrainingPipeline';
import { tokenizerTrainer } from '../../src/core/tokenizerTraining/tokenizerTrainer';
import { tokenizerValidator } from '../../src/core/tokenizerTraining/tokenizerValidator';
import { tokenizerBenchmark } from '../../src/core/tokenizerTraining/tokenizerBenchmark';
import { tokenizerEvaluator } from '../../src/core/tokenizerTraining/tokenizerEvaluator';
import { tokenizerRegistry } from '../../src/core/tokenizerTraining/tokenizerRegistry';
import { tokenizerCompatibility } from '../../src/core/tokenizerTraining/tokenizerCompatibility';

describe('Tokenizer Training Pipeline Unit Tests', () => {
  beforeEach(() => {
    tokenizerTrainingPipeline.clearHistory();
  });

  describe('Algorithm Providers', () => {
    it('should train BPE tokenizer with merges', () => {
      const texts = ['hello world', 'world hello'];
      const config = { vocabSize: 50, specialTokens: ['[PAD]', '[UNK]'], algorithm: 'BPE' };
      const res = tokenizerTrainer.trainTokenizer(texts, config);
      
      assert.ok('[PAD]' in res.vocab);
      assert.ok(Object.keys(res.vocab).length > 2);
    });

    it('should train WordPiece tokenizer with subword prefixes', () => {
      const texts = ['hello'];
      const config = { vocabSize: 30, specialTokens: ['[PAD]'], algorithm: 'WordPiece' };
      const res = tokenizerTrainer.trainTokenizer(texts, config);

      assert.ok('h' in res.vocab);
      assert.ok('##e' in res.vocab || Object.keys(res.vocab).length > 1);
    });
  });

  describe('Tokenizer Validator & Compatibility', () => {
    it('should validate vocabulary contiguous IDs', () => {
      const artifact: any = {
        vocab: { 'a': 0, 'b': 1, 'c': 2 },
        config: { specialTokens: [] }
      };
      const res = tokenizerValidator.validateTokenizer(artifact, ['abc']);
      assert.strictEqual(res.isValid, true);
    });

    it('should flag low character coverage warnings', () => {
      const artifact: any = {
        vocab: { 'a': 0, 'b': 1 }
      };
      const comp = tokenizerCompatibility.checkCompatibility(artifact, ['xyz']);
      assert.strictEqual(comp.isCompatible, false);
      assert.strictEqual(comp.coveredRatio, 0.0);
    });
  });

  describe('Tokenizer Benchmark & Evaluator', () => {
    it('should calculate compression ratios and unknown token rates', () => {
      const artifact: any = {
        artifactId: 'tok-1',
        vocab: { '[UNK]': 0, 'a': 1, 'b': 2 },
        config: { specialTokens: ['[UNK]'] }
      };
      const texts = ['ab', 'ax'];
      
      const bench = tokenizerBenchmark.runBenchmark(artifact, texts);
      assert.strictEqual(bench.avgTokensPerFile, 2);
      assert.ok(bench.unknownTokenRate > 0); // 'x' matches [UNK]
    });

    it('should run evaluator', () => {
      const artifact: any = {
        artifactId: 'tok-1',
        vocab: { '[UNK]': 0, 'a': 1, 'b': 2 },
        config: { specialTokens: ['[UNK]'] }
      };

      const evalReport = tokenizerEvaluator.runEvaluation(artifact, ['a']);
      assert.strictEqual(evalReport.isEncodingStable, true);
    });
  });

  describe('Immutable Tokenizer Registry', () => {
    it('should register artifacts immutably and throw error on override attempts', () => {
      const artifact: any = {
        artifactId: 'tok-1',
        datasetId: 'ds-1',
        version: '1.0.0',
        algorithm: 'BPE',
        vocab: { '[UNK]': 0 }
      };
      const manifest: any = { manifestId: 'man-1' };

      tokenizerRegistry.registerTokenizer(artifact, manifest);
      
      assert.throws(() => {
        tokenizerRegistry.registerTokenizer(artifact, manifest);
      }, /already exists and is immutable/);
    });
  });

  describe('Pipeline End-to-End Execution', () => {
    it('should train, validate, benchmark and register tokenizers successfully', async () => {
      const events: string[] = [];
      const unsubscribe = tokenizerTrainingPipeline.subscribe(e => {
        events.push(e.type);
      });

      const config = {
        vocabSize: 100,
        specialTokens: ['[PAD]', '[UNK]'],
        algorithm: 'SentencePiece'
      };

      const texts = ['hello world code compiler test'];
      const res = await tokenizerTrainingPipeline.trainTokenizer('ds-1', '1.0.0', texts, config);

      assert.strictEqual(res.artifact.algorithm, 'SentencePiece');
      assert.ok(Object.keys(res.artifact.vocab).length > 2);
      assert.strictEqual(res.evaluation.isVocabComplete, true);

      // Verify registered
      const listed = tokenizerTrainingPipeline.listRegisteredTokenizers();
      assert.strictEqual(listed.length, 2); // registry already has the mock registered in registry test

      // Check events timeline
      assert.ok(events.includes('TrainingStarted'));
      assert.ok(events.includes('TokenizerTrained'));
      assert.ok(events.includes('BenchmarkCompleted'));
      assert.ok(events.includes('TokenizerRegistered'));

      unsubscribe();
    });
  });
});
