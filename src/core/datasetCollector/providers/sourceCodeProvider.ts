import { RawFileInput } from '../collectorTypes';

export class SourceCodeProvider {
  public filterSourceCode(files: RawFileInput[]): RawFileInput[] {
    const codeExtensions = [
      'ts', 'tsx', 'js', 'jsx', 'cjs', 'mjs',
      'py', 'java', 'cpp', 'c', 'h', 'hpp', 'cs',
      'go', 'rs', 'php', 'rb', 'swift', 'kt', 'kts',
      'sh', 'sql', 'scala', 'dart'
    ];

    return files.filter(f => {
      const ext = f.path.split('.').pop()?.toLowerCase();
      return ext && codeExtensions.includes(ext);
    });
  }
}

export const sourceCodeProvider = new SourceCodeProvider();
