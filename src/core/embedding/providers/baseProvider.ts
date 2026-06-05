export interface EmbeddingProvider {
  name: string;
  dimensions: number;
  generate(content: string): Promise<number[]>;
}
