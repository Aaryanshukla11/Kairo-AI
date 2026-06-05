import { PromptRequest, CompiledPromptResult, PromptCompilerEventType } from './promptTypes';
import { templateEngine } from './templateEngine';
import { promptAssembler } from './promptAssembler';
import { promptOptimizer } from './promptOptimizer';
import { promptCompressor } from './promptCompressor';
import { promptSanitizer } from './promptSanitizer';
import { promptValidator } from './promptValidator';
import { promptMetricsCalculator } from './promptMetrics';
import { promptEvents } from './promptEvents';
import { promptHistory } from './promptHistory';
import { promptCache } from './promptCache';

export class CompilerEngine {
  public async compile(request: PromptRequest, tokenLimit = 32768): Promise<CompiledPromptResult> {
    const start = Date.now();
    promptEvents.emit(PromptCompilerEventType.RequestReceived, { type: request.type });

    // Load template
    const template = templateEngine.getTemplate(request.type);
    promptEvents.emit(PromptCompilerEventType.TemplateLoaded, { name: template.name });

    // Assemble prompts
    const assembledSystem = promptAssembler.assembleSystemPrompt(
      template.systemInstructions,
      template.developerInstructions,
      request.workspaceRules
    );
    const assembledUser = promptAssembler.assembleUserPrompt(request);

    const fullPrompt = `${assembledSystem}\n\n${assembledUser}`;
    promptEvents.emit(PromptCompilerEventType.ContextInjected);

    // Optimize
    const { optimized, report: optReport } = promptOptimizer.optimize(fullPrompt);
    promptEvents.emit(PromptCompilerEventType.PromptOptimized);

    // Compress
    const { compressed, report: compReport } = promptCompressor.compress(optimized);

    // Sanitize
    const sanitized = promptSanitizer.sanitize(compressed);

    // Validate
    promptValidator.validate(request, sanitized, tokenLimit);
    promptEvents.emit(PromptCompilerEventType.PromptValidated);

    // Final Metric Reports
    const duration = Date.now() - start;
    const metrics = promptMetricsCalculator.calculate(
      assembledSystem,
      request.userPrompt,
      request.compiledContext || '',
      duration
    );

    const report = {
      reportId: `PRM-REP-${Date.now()}`,
      timestamp: Date.now(),
      type: request.type,
      templateName: template.name,
      optimization: optReport,
      compression: compReport,
      metrics
    };

    promptHistory.logReport(report);

    const result: CompiledPromptResult = {
      compiledPrompt: sanitized,
      systemPrompt: assembledSystem,
      userPrompt: request.userPrompt,
      report
    };

    // Cache result
    const cacheKey = JSON.stringify({ type: request.type, prompt: request.userPrompt });
    promptCache.set(cacheKey, result);

    promptEvents.emit(PromptCompilerEventType.CompilationCompleted, { report });

    return result;
  }
}

export const compilerEngine = new CompilerEngine();
