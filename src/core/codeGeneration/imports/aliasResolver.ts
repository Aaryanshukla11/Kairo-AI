export class AliasResolver {
  private aliases = new Map<string, string>([
    ['@/core', 'src/core'],
    ['@/common', 'src/common'],
    ['@/webview', 'src/webview']
  ]);

  public resolveAlias(source: string): string {
    for (const [key, value] of this.aliases.entries()) {
      if (source.startsWith(key)) {
        return source.replace(key, value);
      }
    }
    return source;
  }

  public getAliases(): { alias: string; resolved: string }[] {
    return Array.from(this.aliases.entries()).map(([alias, resolved]) => ({ alias, resolved }));
  }
}

export const aliasResolver = new AliasResolver();
