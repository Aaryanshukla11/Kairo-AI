import { RawFileInput } from '../collectorTypes';

export class MarkdownProvider {
  public filterMarkdownFiles(files: RawFileInput[]): RawFileInput[] {
    return files.filter(f => {
      const ext = f.path.split('.').pop()?.toLowerCase();
      return ext === 'md' || ext === 'markdown' || ext === 'mdx';
    }).map(f => ({
      ...f,
      language: 'Markdown'
    }));
  }
}

export const markdownProvider = new MarkdownProvider();
