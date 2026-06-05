import { EmbeddingSourceType } from './embeddingTypes';

export class EmbeddingValidator {
  /**
   * Validates target properties and throws exceptions on empty content or wrong source types.
   */
  public validate(sourceId: string, sourceType: EmbeddingSourceType, content: string): void {
    if (!sourceId || !sourceId.trim()) {
      throw new Error('Embedding validation error: Source ID is required');
    }

    if (!sourceType || !Object.values(EmbeddingSourceType).includes(sourceType)) {
      throw new Error(`Embedding validation error: Invalid or unsupported source type "${sourceType}"`);
    }

    if (!content || !content.trim()) {
      throw new Error('Embedding validation error: Embedding content cannot be empty');
    }
  }
}

export const embeddingValidator = new EmbeddingValidator();
