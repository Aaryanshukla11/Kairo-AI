import { RawFileInput } from '../collectorTypes';

export class DocumentationProvider {
  public filterDocFiles(files: RawFileInput[]): RawFileInput[] {
    const docExtensions = ['md', 'markdown', 'rst', 'txt', 'pdf', 'html', 'adoc'];
    return files.filter(f => {
      const ext = f.path.split('.').pop()?.toLowerCase();
      const isDocPath = f.path.toLowerCase().includes('/docs/') || f.path.toLowerCase().includes('/documentation/');
      return (ext && docExtensions.includes(ext)) || isDocPath;
    });
  }
}

export const documentationProvider = new DocumentationProvider();
