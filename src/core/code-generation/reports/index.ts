export interface GenerationReport {
  executionTimeMs: number;
  modulesExecuted: string[];
  warnings: string[];
  errors: string[];
  artifacts: Record<string, string>;
  summary: string;
}

export class ReportGenerator {
  public generate(
    startTime: number,
    modules: string[],
    warnings: string[],
    errors: string[],
    artifacts: Record<string, string>
  ): GenerationReport {
    const endTime = Date.now();
    const executionTimeMs = endTime - startTime;
    const summary = `Generated ${Object.keys(artifacts).length} files across ${modules.length} active stages. Status: ${errors.length === 0 ? '🟢 SUCCESS' : '🔴 FAILED'}`;

    return {
      executionTimeMs,
      modulesExecuted: [...modules],
      warnings: [...warnings],
      errors: [...errors],
      artifacts: { ...artifacts },
      summary
    };
  }
}

export const reportGenerator = new ReportGenerator();
export default reportGenerator;
