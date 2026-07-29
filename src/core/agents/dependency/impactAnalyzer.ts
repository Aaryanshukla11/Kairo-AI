export interface ImpactReportItem {
  packageName: string;
  dependentsCount: number;
  severity: 'Low' | 'Medium' | 'High';
}

export class ImpactAnalyzer {
  public analyzeImpact(edges: { from: string; to: string }[]): ImpactReportItem[] {
    const counts = new Map<string, number>();
    for (const edge of edges) {
      counts.set(edge.to, (counts.get(edge.to) || 0) + 1);
    }

    const report: ImpactReportItem[] = [];
    for (const [pkg, count] of counts.entries()) {
      let severity: 'Low' | 'Medium' | 'High' = 'Low';
      if (count > 5) {
        severity = 'High';
      } else if (count > 2) {
        severity = 'Medium';
      }
      report.push({
        packageName: pkg,
        dependentsCount: count,
        severity
      });
    }

    return report;
  }
}

export const impactAnalyzer = new ImpactAnalyzer();
