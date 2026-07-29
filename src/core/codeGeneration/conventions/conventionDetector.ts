export class ConventionDetector {
  public detectCasing(name: string): 'camelCase' | 'snakeCase' | 'PascalCase' {
    if (name.includes('_')) {
      return 'snakeCase';
    }
    const firstChar = name.charAt(0);
    if (firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase()) {
      return 'PascalCase';
    }
    return 'camelCase';
  }
}

export const conventionDetector = new ConventionDetector();
