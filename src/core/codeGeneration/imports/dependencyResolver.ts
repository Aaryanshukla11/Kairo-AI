export class DependencyResolver {
  public verifyDependency(source: string, targetFile: string): boolean {
    // Basic verification check: common should never import from core
    if (targetFile.includes('common') && source.includes('core')) {
      return false;
    }
    return true;
  }
}

export const dependencyResolver = new DependencyResolver();
