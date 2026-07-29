import { virtualFilesystem } from './virtualFilesystem';

export class VirtualDependencies {
  public verify(filePath: string): boolean {
    if (filePath.endsWith('package.json')) {
      const content = virtualFilesystem.read(filePath);
      if (content) {
        try {
          JSON.parse(content);
        } catch {
          return false;
        }
      }
    }
    return true;
  }
}
export const virtualDependencies = new VirtualDependencies();
