import * as assert from 'assert';
import { registryEngine } from '../../src/core/modelRegistry/registryEngine';
import { registryScanner } from '../../src/core/modelRegistry/registryScanner';
import { modelCapabilitiesDetector } from '../../src/core/modelRegistry/modelCapabilities';
import { modelCompatibilityAnalyzer } from '../../src/core/modelRegistry/modelCompatibility';
import { modelHealthMonitor } from '../../src/core/modelRegistry/modelHealth';
import { ModelCapability, ModelState } from '../../src/core/modelRegistry/registryTypes';

describe('Model Registry Tests', () => {
  describe('Capability Detection', () => {
    it('should correctly detect capabilities for a code model', () => {
      const mockModel: any = {
        modelId: 'qwen-2.5-7b-coder',
        displayName: 'Qwen 2.5 7B Coder (Mock)',
        provider: 'gguf',
        contextLength: 32768,
        parameters: '7B',
        quantization: 'Q4_K_M',
        tokenizer: 'qwen',
        memoryRequirementGb: 6,
        diskSizeGb: 4.5
      };

      const report = modelCapabilitiesDetector.detectCapabilities(mockModel);
      assert.ok(report.supported.includes(ModelCapability.CodeGeneration));
      assert.ok(report.supported.includes(ModelCapability.CodeCompletion));
      assert.ok(report.supported.includes(ModelCapability.ToolCalling));
      assert.ok(report.supported.includes(ModelCapability.LongContext));
    });

    it('should correctly detect reasoning/planning for reasoning model', () => {
      const mockModel: any = {
        modelId: 'deepseek-reasoning',
        displayName: 'DeepSeek Reasoning (Mock)',
        provider: 'gguf',
        contextLength: 8192,
        parameters: '8B',
        quantization: 'Q4_K_M',
        tokenizer: 'llama',
        memoryRequirementGb: 8,
        diskSizeGb: 4.9
      };

      const report = modelCapabilitiesDetector.detectCapabilities(mockModel);
      assert.ok(report.supported.includes(ModelCapability.Reasoning));
      assert.ok(report.supported.includes(ModelCapability.Planning));
    });
  });

  describe('Compatibility Analysis', () => {
    it('should pass compatibility when RAM is sufficient', () => {
      const mockModel: any = {
        modelId: 'qwen-2.5-7b-coder',
        displayName: 'Qwen 2.5 7B Coder (Mock)',
        memoryRequirementGb: 8,
        format: 'gguf',
        parameters: '7B'
      };

      const report = modelCompatibilityAnalyzer.generateReport(mockModel, 16, 'windows', 'x64');
      assert.strictEqual(report.compatible, true);
      assert.strictEqual(report.issues.length, 0);
    });

    it('should report incompatibilities when RAM is low', () => {
      const mockModel: any = {
        modelId: 'llama-3-70b',
        displayName: 'Llama 3 70B',
        memoryRequirementGb: 40,
        format: 'gguf',
        parameters: '70B'
      };

      const report = modelCompatibilityAnalyzer.generateReport(mockModel, 16, 'windows', 'x64');
      assert.strictEqual(report.compatible, false);
      assert.ok(report.issues.some(issue => issue.includes('Insufficient System RAM')));
    });

    it('should flag MLX on non-mac platform', () => {
      const mockModel: any = {
        modelId: 'mlx-model',
        displayName: 'MLX Model',
        memoryRequirementGb: 8,
        format: 'mlx',
        parameters: '7B'
      };

      const report = modelCompatibilityAnalyzer.generateReport(mockModel, 16, 'windows', 'x64');
      assert.strictEqual(report.compatible, false);
      assert.ok(report.issues.some(issue => issue.includes('MLX Format Incompatibility')));
    });
  });

  describe('Health Monitoring', () => {
    it('should generate a correct health report for mixed model states', () => {
      const models: any[] = [
        { modelId: 'm1', state: ModelState.Ready, healthStatus: 'Healthy' },
        { modelId: 'm2', state: ModelState.Deprecated, healthStatus: 'Healthy' },
        { modelId: 'm3', state: ModelState.Corrupted, healthStatus: 'Healthy' }
      ];

      const report = modelHealthMonitor.generateReport(models);
      assert.strictEqual(report.healthyCount, 1);
      assert.strictEqual(report.degradedCount, 1);
      assert.strictEqual(report.unhealthyCount, 1);
    });
  });
});
