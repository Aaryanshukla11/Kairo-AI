export interface ITemplateProvider {
  getTemplate(key: string): string;
}

export class MemoryTemplateProvider implements ITemplateProvider {
  private templates = new Map<string, string>([
    ['dockerfile', 'FROM node:20-alpine\nWORKDIR /app\n'],
    ['gitignore', 'node_modules/\ndist/\n.env\n']
  ]);

  public getTemplate(key: string): string {
    return this.templates.get(key) || '';
  }
}
