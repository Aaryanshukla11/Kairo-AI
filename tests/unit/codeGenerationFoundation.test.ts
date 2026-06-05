import * as assert from 'assert';
import { centralConfig } from '../../src/core/code-generation/configuration';
import { logger } from '../../src/core/code-generation/logger';
import { eventBus, CodeGenEvent } from '../../src/core/code-generation/events';
import { GenerationContext } from '../../src/core/code-generation/context';
import { GeneratorRegistry } from '../../src/core/code-generation/registry';
import { codeGenValidator } from '../../src/core/code-generation/validators';
import { PipelineEngine, PipelineStage } from '../../src/core/code-generation/pipeline';
import { reportGenerator } from '../../src/core/code-generation/reports';
import { BaseGenerator } from '../../src/core/code-generation/generators';
import { IGenerationContext } from '../../src/core/code-generation/interfaces';

describe('Phase 9 - Code Generation Engine Foundation Tests', () => {

  describe('Configuration System', () => {
    it('should retrieve default values and allow setting overrides', () => {
      const config = centralConfig.getConfig();
      assert.strictEqual(config.validationMode, 'strict');
      assert.strictEqual(config.loggingLevel, 'INFO');

      centralConfig.updateConfig({ validationMode: 'loose' });
      assert.strictEqual(centralConfig.getConfig().validationMode, 'loose');
      centralConfig.updateConfig({ validationMode: 'strict' }); // revert
    });
  });

  describe('Structured Logging System', () => {
    it('should save written logs context and respect dynamic levels filters', () => {
      logger.clearLogs();
      logger.setLevel('WARNING');
      logger.info('Should not log this info message');
      logger.warn('This is a warning log');
      logger.error('This is an error log');

      const logs = logger.getLogs();
      assert.strictEqual(logs.length, 2);
      assert.ok(logs[0].includes('[WARNING] This is a warning log'));
      assert.ok(logs[1].includes('[ERROR] This is an error log'));
      logger.setLevel('INFO'); // revert
    });
  });

  describe('Event Bus System', () => {
    it('should trigger subscribed listeners upon event publishes notifications', () => {
      let triggered = false;
      let payloadReceived: any = null;

      const unsubscribe = eventBus.subscribe('ModuleStarted', (event: CodeGenEvent) => {
        triggered = true;
        payloadReceived = event.payload;
      });

      eventBus.publish('ModuleStarted', { moduleId: 'test-gen-1' });
      assert.strictEqual(triggered, true);
      assert.strictEqual(payloadReceived.moduleId, 'test-gen-1');

      unsubscribe();
    });
  });

  describe('Immutable Context System', () => {
    it('should return new instances upon property overrides and keep original values clean', () => {
      const ctx1 = new GenerationContext().withPrompt('Build Hospital API');
      const ctx2 = ctx1.withDetectedFramework('FastAPI');

      assert.strictEqual(ctx1.getPrompt(), 'Build Hospital API');
      assert.strictEqual(ctx1.getDetectedFramework(), null);

      assert.strictEqual(ctx2.getPrompt(), 'Build Hospital API');
      assert.strictEqual(ctx2.getDetectedFramework(), 'FastAPI');
    });
  });

  describe('Generator Registry', () => {
    class MockGenerator extends BaseGenerator {
      public id = 'mock-gen';
      public name = 'Mock Generator';
      public version = '1.0.0';
      public description = 'Generates dummy boilerplate logs';
      public supportedLanguages = ['TypeScript'];
      public supportedFrameworks = ['Express'];
      public supportedProjectTypes = ['SaaS'];
      public priority = 1;
      public dependencies: string[] = [];

      public async execute(context: IGenerationContext): Promise<IGenerationContext> {
        return context;
      }
    }

    it('should registers and unregisters generator modules configurations successfully', () => {
      const reg = new GeneratorRegistry();
      const mock = new MockGenerator();

      reg.register(mock);
      assert.strictEqual(reg.resolve('mock-gen'), mock);
      assert.strictEqual(reg.priority('mock-gen'), 1);

      reg.unregister('mock-gen');
      assert.strictEqual(reg.resolve('mock-gen'), undefined);
    });

    it('should throw an error when registering duplicate IDs', () => {
      const reg = new GeneratorRegistry();
      const mock = new MockGenerator();
      reg.register(mock);

      assert.throws(() => {
        reg.register(mock);
      }, /Duplicate registration/);
    });
  });

  describe('Validation Layer & Cycle Detector', () => {
    class CycleGenerator extends BaseGenerator {
      constructor(
        public id: string,
        public dependencies: string[]
      ) {
        super();
      }
      public name = 'Cycle Generator';
      public version = '1.0.0';
      public description = 'Cycle test module';
      public supportedLanguages = ['TypeScript'];
      public supportedFrameworks = ['Express'];
      public supportedProjectTypes = ['SaaS'];
      public priority = 1;

      public async execute(context: IGenerationContext): Promise<IGenerationContext> {
        return context;
      }
    }

    it('should throws validation error when a dependency cycle is detected', () => {
      const g1 = new CycleGenerator('gen-1', ['gen-2']);
      const g2 = new CycleGenerator('gen-2', ['gen-1']);

      assert.throws(() => {
        codeGenValidator.validateRegistry([g1, g2]);
      }, /Circular dependency detected/);
    });
  });

  describe('Pipeline Stage Engine', () => {
    it('should executes stages chronologically and pass down context results', async () => {
      const pipe = new PipelineEngine();
      
      const s1 = new PipelineStage('Stage1', async (ctx) => {
        return ctx.withPrompt(ctx.getPrompt() + ' Stage 1');
      });
      const s2 = new PipelineStage('Stage2', async (ctx) => {
        return ctx.withPrompt(ctx.getPrompt() + ' Stage 2');
      });

      pipe.addStage(s1);
      pipe.addStage(s2);

      const initCtx = new GenerationContext().withPrompt('Init');
      const finalCtx = await pipe.execute(initCtx);

      assert.strictEqual(finalCtx.getPrompt(), 'Init Stage 1 Stage 2');
    });
  });

  describe('Report System', () => {
    it('should compile correct elapsed timing summaries and artifacts descriptions', () => {
      const start = Date.now() - 150;
      const report = reportGenerator.generate(
        start,
        ['Requirement', 'Planning'],
        ['Low disk memory warning'],
        [],
        { 'package.json': '{}' }
      );

      assert.ok(report.executionTimeMs >= 150);
      assert.strictEqual(report.modulesExecuted.length, 2);
      assert.strictEqual(report.warnings[0], 'Low disk memory warning');
      assert.strictEqual(report.artifacts['package.json'], '{}');
      assert.ok(report.summary.includes('🟢 SUCCESS'));
    });
  });

});
