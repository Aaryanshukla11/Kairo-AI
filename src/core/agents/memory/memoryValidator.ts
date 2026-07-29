import { Memory } from './memoryTypes';

export class MemoryValidator {
  public validate(memory: Partial<Memory>, existingIds: Set<string>): void {
    if (!memory) {
      throw new Error('Memory validation error: Entry cannot be null');
    }
    if (!memory.id || !memory.id.trim()) {
      throw new Error('Memory validation error: Memory ID cannot be empty');
    }
    if (existingIds.has(memory.id)) {
      throw new Error(`Memory validation error: Duplicate memory ID "${memory.id}" detected`);
    }
    if (!memory.title || !memory.title.trim()) {
      throw new Error('Memory validation error: Title cannot be empty');
    }
    if (!memory.content || !memory.content.trim()) {
      throw new Error('Memory validation error: Content cannot be empty');
    }
    if (!memory.type) {
      throw new Error('Memory validation error: Memory type must be specified');
    }
    if (memory.importance !== undefined && (memory.importance < 1 || memory.importance > 10)) {
      throw new Error('Memory validation error: Importance must be between 1 and 10');
    }
    
    if (memory.tags && !Array.isArray(memory.tags)) {
      throw new Error('Memory validation error: Tags must be a string array');
    }
    if (memory.relatedFiles && !Array.isArray(memory.relatedFiles)) {
      throw new Error('Memory validation error: relatedFiles must be a string array');
    }
    if (memory.relatedTasks && !Array.isArray(memory.relatedTasks)) {
      throw new Error('Memory validation error: relatedTasks must be a string array');
    }
    if (memory.relatedCommits && !Array.isArray(memory.relatedCommits)) {
      throw new Error('Memory validation error: relatedCommits must be a string array');
    }
  }
}

export const memoryValidator = new MemoryValidator();
