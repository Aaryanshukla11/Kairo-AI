export class FileClassifier {
  /**
   * Classifies a file into a high-level category based on its name and extension.
   */
  public static classify(fileName: string, extension: string): string {
    const nameLower = fileName.toLowerCase();
    const extLower = extension.toLowerCase();

    // Configuration
    if (
      nameLower.includes('config') || 
      nameLower.startsWith('.') ||
      ['.json', '.yaml', '.yml', '.env'].includes(extLower)
    ) {
      if (nameLower === 'package.json') return 'Configuration';
      return 'Configuration';
    }

    // Documentation
    if (['.md', '.txt'].includes(extLower) || nameLower.includes('readme') || nameLower.includes('license')) {
      return 'Documentation';
    }

    // Assets
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'].includes(extLower)) {
      return 'Assets';
    }

    // Tests
    if (nameLower.includes('.test.') || nameLower.includes('.spec.') || nameLower.includes('__tests__')) {
      return 'Tests';
    }

    // Source
    if (['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.html', '.css', '.scss'].includes(extLower)) {
      return 'Source';
    }

    // Scripts
    if (['.sh', '.bat', '.ps1'].includes(extLower)) {
      return 'Scripts';
    }

    return 'Unknown';
  }
}
