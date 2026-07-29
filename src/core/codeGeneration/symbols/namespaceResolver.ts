export class NamespaceResolver {
  public resolveNamespace(filePath: string): string {
    const parts = filePath.split('/');
    if (parts.length > 2) {
      return parts.slice(0, parts.length - 1).join('.');
    }
    return 'global';
  }
}

export const namespaceResolver = new NamespaceResolver();
