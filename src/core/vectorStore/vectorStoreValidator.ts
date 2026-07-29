import { VectorRecord } from './vectorStoreTypes';

export class VectorStoreValidator {
  /**
   * Asserts vector properties, checking dimensions count, NaNs elements, and metadata completeness.
   */
  public validate(record: VectorRecord, expectedDimensions?: number): void {
    if (!record.id || !record.id.trim()) {
      throw new Error('Vector store validation error: Vector ID is required');
    }

    if (!record.vector || !Array.isArray(record.vector) || record.vector.length === 0) {
      throw new Error('Vector store validation error: Vector array is required and cannot be empty');
    }

    if (expectedDimensions !== undefined && record.vector.length !== expectedDimensions) {
      throw new Error(`Vector store validation error: Dimension mismatch: Expected ${expectedDimensions}, but got ${record.vector.length}`);
    }

    const hasNaN = record.vector.some(val => typeof val !== 'number' || isNaN(val) || !isFinite(val));
    if (hasNaN) {
      throw new Error('Vector store validation error: Vector array contains corrupted/invalid decimal values');
    }

    if (!record.metadata || typeof record.metadata !== 'object') {
      throw new Error('Vector store validation error: Invalid metadata object structure');
    }
  }
}

export const vectorStoreValidator = new VectorStoreValidator();
