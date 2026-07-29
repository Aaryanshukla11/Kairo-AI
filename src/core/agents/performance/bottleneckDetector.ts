import { Bottleneck } from './performanceTypes';

export class BottleneckDetector {
  public detect(
    buildTime: number,
    cpuUsage: number,
    memoryUsage: number,
    bundleSize: number
  ): Bottleneck[] {
    const list: Bottleneck[] = [];

    if (buildTime > 5000) {
      list.push({
        id: 'btn-1',
        component: 'Compiler Build Pipeline',
        metric: 'BundleSize',
        value: `${buildTime} ms`,
        severity: 'Medium',
        description: 'Build compilation time exceeds performance margins. Recommend optimizing esbuild caches.'
      });
    }

    if (cpuUsage > 75) {
      list.push({
        id: 'btn-2',
        component: 'Agent Event Router Thread',
        metric: 'CPU',
        value: `${cpuUsage} %`,
        severity: 'High',
        description: 'High CPU load detected. Recommend offloading intensive loop tasks to separate worker threads.'
      });
    }

    if (memoryUsage > 500) {
      list.push({
        id: 'btn-3',
        component: 'Language Server Server processes',
        metric: 'Memory',
        value: `${memoryUsage} MB`,
        severity: 'High',
        description: 'Memory footprint exceeds 500MB. Inspect logs for heap leaks.'
      });
    }

    if (bundleSize > 1000) {
      list.push({
        id: 'btn-4',
        component: 'Webview UI Panel Asset bundle',
        metric: 'BundleSize',
        value: `${bundleSize} KB`,
        severity: 'Low',
        description: 'UI bundle exceeds 1MB. Optimize imports and code splitting.'
      });
    }

    return list;
  }
}

export const bottleneckDetector = new BottleneckDetector();
