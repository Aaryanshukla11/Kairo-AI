import { RawFileInput } from '../collectorTypes';

export class JsonProvider {
  public filterJsonFiles(files: RawFileInput[]): RawFileInput[] {
    return files.filter(f => {
      const ext = f.path.split('.').pop()?.toLowerCase();
      return ext === 'json' || ext === 'jsonl' || ext === 'geojson';
    }).map(f => ({
      ...f,
      language: 'JSON'
    }));
  }
}

export const jsonProvider = new JsonProvider();
