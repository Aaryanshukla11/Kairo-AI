export class ProjectDetector {
  /**
   * Identifies the primary framework used in the workspace by scanning root files.
   * Note: This is an architectural stub matching the M01-S03-T005 spec.
   */
  public static detectFramework(rootFiles: string[]): string {
    const fileSet = new Set(rootFiles);

    if (fileSet.has('next.config.js') || fileSet.has('next.config.mjs')) return 'Next.js';
    if (fileSet.has('vite.config.ts') || fileSet.has('vite.config.js')) return 'Vite';
    if (fileSet.has('angular.json')) return 'Angular';
    if (fileSet.has('vue.config.js')) return 'Vue';
    
    // Fallbacks
    if (fileSet.has('package.json')) {
      // In a real implementation we would read the package.json to detect React/Express etc.
      // We return Node as the baseline for package.json presence
      return 'Node'; 
    }

    if (fileSet.has('index.html')) return 'HTML';

    return 'Unknown';
  }
}
