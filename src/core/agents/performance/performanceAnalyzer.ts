import { complexityAnalyzer } from './complexityAnalyzer';
import { bottleneckDetector } from './bottleneckDetector';
import { performanceProfiler } from './performanceProfiler';
import { performancePredictor } from './performancePredictor';
import { benchmarkManager } from './benchmarkManager';
import { PerformanceReport } from './performanceTypes';
import * as fs from 'fs';

export class PerformanceAnalyzer {
  public runAnalysis(filePath: string): PerformanceReport {
    const prof = performanceProfiler.profile();
    const benchmark = benchmarkManager.executeMockBenchmark();

    let content = '';
    if (filePath && fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf-8');
    }

    const complexReports = complexityAnalyzer.analyzeCode(filePath || 'src/core/agents/agentRegistry.ts', content);
    
    let score = 95;
    if (prof.cpuUsagePercent > 70) score -= 15;
    if (prof.memoryUsageMb > 400) score -= 10;
    
    const hasQuadratic = complexReports.some(c => c.estimatedComplexity === 'O(N^2)');
    if (hasQuadratic) score -= 20;

    const finalScore = Math.max(10, score);
    const { trend, level } = performancePredictor.predictFutureTrend(finalScore);

    const bottlenecks = bottleneckDetector.detect(
      prof.buildTimeMs,
      prof.cpuUsagePercent,
      prof.memoryUsageMb,
      prof.bundleSizeKb
    );

    const suggestions = bottlenecks.map(b => b.description);
    if (suggestions.length === 0) {
      suggestions.push('Maintain clean bundle size profiles by lazy-loading non-critical plugins.');
    }

    return {
      performanceId: `perf-scan-${Date.now()}`,
      overallScore: finalScore,
      overallLevel: level,
      detectedBottlenecks: bottlenecks,
      hotPaths: bottlenecks.map(b => b.component),
      complexityReport: complexReports,
      memoryUsageMb: prof.memoryUsageMb,
      cpuUsagePercent: prof.cpuUsagePercent,
      bundleSizeKb: prof.bundleSizeKb,
      buildTimeMs: prof.buildTimeMs,
      optimizationSuggestions: suggestions
    };
  }
}

export const performanceAnalyzer = new PerformanceAnalyzer();
