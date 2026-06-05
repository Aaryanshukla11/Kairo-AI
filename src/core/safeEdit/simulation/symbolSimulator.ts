import { virtualSymbols } from '../../virtualWorkspace/virtualSymbols';

export class SymbolSimulator {
  public simulateSymbols(targetFile: string): string[] {
    return virtualSymbols.extract(targetFile);
  }
}
export const symbolSimulator = new SymbolSimulator();
