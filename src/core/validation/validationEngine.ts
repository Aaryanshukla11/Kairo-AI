import { validationRules } from './validationRules';
import { validationScorer } from './validationScorer';
import { diagnosticsCollector } from './diagnosticsCollector';
import { validationReporter } from './validationReporter';
import { validationEvents } from './validationEvents';
import { validationMetrics } from './validationMetrics';
import { ValidationReport, ValidationEventType } from './validationTypes';
import { validationRegistry } from './validationRegistry';
import { typescriptValidation } from './providers/typescriptValidation';
import { javascriptValidation } from './providers/javascriptValidation';
import { reactValidation } from './providers/reactValidation';
import { nodeValidation } from './providers/nodeValidation';

export class ValidationEngine {
  constructor() {
    validationRegistry.register(typescriptValidation);
    validationRegistry.register(javascriptValidation);
    validationRegistry.register(reactValidation);
    validationRegistry.register(nodeValidation);
  }

  public async validate(targetFile: string, content: string): Promise<ValidationReport> {
    validationEvents.emit(ValidationEventType.ValidationStarted, { targetFile });

    const issues = validationRules.execute(content);
    for (const issue of issues) {
      validationEvents.emit(ValidationEventType.RuleExecuted, { issue });
    }

    const { blocking, warnings } = diagnosticsCollector.collect(issues);
    for (const block of blocking) {
      validationEvents.emit(ValidationEventType.DiagnosticGenerated, { message: block, isBlocking: true });
    }

    const score = validationScorer.calculateScore(issues);
    const passed = issues.length === 0 ? ['VAL-001', 'VAL-002'] : [];
    const failed = issues.map(i => i.ruleId);

    const report = validationReporter.compileReport(
      Date.now().toString(),
      score,
      passed,
      failed,
      blocking,
      warnings
    );

    validationMetrics.record(blocking.length > 0);
    validationEvents.emit(ValidationEventType.ValidationCompleted, { report });

    return report;
  }

  public subscribe(listener: any): () => void {
    return validationEvents.subscribe(listener);
  }
}

export const validationEngine = new ValidationEngine();
