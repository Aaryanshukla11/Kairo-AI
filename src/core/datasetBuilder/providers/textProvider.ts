import { DatasetFileItem } from '../datasetTypes';

export class TextProvider {
  public parseText(txt: string): DatasetFileItem {
    return {
      path: 'text.txt',
      content: txt,
      sizeBytes: txt.length,
      tokenEstimate: Math.ceil(txt.length / 4),
      language: 'Plain Text'
    };
  }
}
