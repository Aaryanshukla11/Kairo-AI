import { EmbeddingProvider } from './baseProvider';

export class MockProvider implements EmbeddingProvider {
  public name = 'MockOfflineProvider';
  public dimensions = 384;

  /**
   * Generates deterministic mock vector array numbers.
   */
  public async generate(content: string): Promise<number[]> {
    const vector: number[] = [];
    const len = content.length;
    for (let i = 0; i < this.dimensions; i++) {
      const code = len > 0 ? content.charCodeAt(i % len) : 0;
      vector.push(Math.sin(code + i) * 0.5 + 0.5);
    }
    return vector;
  }
}
