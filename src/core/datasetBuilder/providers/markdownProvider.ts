import { DatasetFileItem } from '../datasetTypes';

export class MarkdownProvider {
  public parseMarkdown(mdText: string): DatasetFileItem {
    return {
      path: 'doc.md',
      content: mdText,
      sizeBytes: mdText.length,
      tokenEstimate: Math.ceil(mdText.length / 4),
      language: 'Markdown'
    };
  }
}
