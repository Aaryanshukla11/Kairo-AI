import { DatasetFileItem } from '../datasetTypes';

export class JsonProvider {
  public parseJson(jsonText: string): DatasetFileItem {
    return {
      path: 'data.json',
      content: jsonText,
      sizeBytes: jsonText.length,
      tokenEstimate: Math.ceil(jsonText.length / 4),
      language: 'JSON'
    };
  }
}
