import { ProjectContext } from './contextTypes';

export class ContextValidator {
  /**
   * Enforces rules checking missing roots, empty packages, duplicate files, or wrong size tags.
   */
  public validate(context: ProjectContext): void {
    if (!context.workspace.rootPath) {
      throw new Error('Context validation error: Workspace root path is missing');
    }

    if (context.files.length === 0 && !context.selection.selectedText) {
      throw new Error('Context validation error: Context package cannot be empty (no files or selection text)');
    }

    const filePaths = context.files.map(f => f.filePath);
    const uniquePaths = new Set(filePaths);
    if (filePaths.length !== uniquePaths.size) {
      throw new Error('Context validation error: Duplicate files detected in context info');
    }

    if (context.metadata.tokenEstimateTotal < 0 || context.metadata.sizeBytesTotal < 0) {
      throw new Error('Context validation error: Invalid total metrics metadata');
    }
  }
}

export const contextValidator = new ContextValidator();
