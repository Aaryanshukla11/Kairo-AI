import { virtualFilesystem } from './virtualFilesystem';

export class VirtualSymbols {
  public extract(filePath: string): string[] {
    const content = virtualFilesystem.read(filePath);
    if (!content) return [];
    
    const symbols: string[] = [];
    const classRegex = /class\s+(\w+)/g;
    let match;
    while ((match = classRegex.exec(content)) !== null) {
      symbols.push(match[1]);
    }
    return symbols;
  }
}
export const virtualSymbols = new VirtualSymbols();
