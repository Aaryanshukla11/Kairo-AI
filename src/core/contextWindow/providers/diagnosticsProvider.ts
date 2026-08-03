import { ContextItem, ContextPriority } from '../contextTypes';

export class DiagnosticsProvider {
  public collect(problems: string[]): ContextItem[] {
    return problems.map((prob, idx) => ({
      id: `diag-${idx}`,
      source: 'diagnostics',
      content: `Diagnostic issue: ${prob}`,
      tokenCount: Math.ceil(prob.length / 4),
      priority: ContextPriority.High,
      score: 0.8
    }));
  }
}
