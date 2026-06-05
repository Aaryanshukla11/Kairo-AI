import { IPlanningTask } from '../planning-contract/types';
import { IValidationError } from './types';

export class SafetyValidator {
  public validateSafety(tasks: readonly IPlanningTask[]): IValidationError[] {
    const errors: IValidationError[] = [];

    const shellRegex = /\b(rm|mv|curl|wget|bash|sh|powershell|cmd|sudo|chmod)\b/i;
    const pathEscapeRegex = /\.\.\//;

    for (const task of tasks) {
      // 1. Check arbitrary shell executions in input, output, or descriptions
      if (
        shellRegex.test(task.description) ||
        shellRegex.test(task.input) ||
        shellRegex.test(task.expectedOutput)
      ) {
        errors.push({
          errorId: `safety-shell-${task.taskId}`,
          category: 'SAFETY',
          description: `Task attempts to execute dangerous system commands. Found in task description/input/output.`,
          severity: 'CRITICAL',
          affectedTask: task.taskId,
          suggestedResolution: 'Remove system terminal execution details from planning tasks.'
        });
      }

      // 2. Check path escaping escaping workspace boundaries
      if (
        pathEscapeRegex.test(task.description) ||
        pathEscapeRegex.test(task.input) ||
        pathEscapeRegex.test(task.expectedOutput)
      ) {
        errors.push({
          errorId: `safety-escape-${task.taskId}`,
          category: 'SAFETY',
          description: `Task attempts to reference files outside the workspace directory root using '..'.`,
          severity: 'CRITICAL',
          affectedTask: task.taskId,
          suggestedResolution: 'Constrain all file paths inside the repository project boundaries.'
        });
      }

      // 3. Check for deletion of files
      if (
        task.description.toLowerCase().includes('delete file') ||
        task.description.toLowerCase().includes('remove file')
      ) {
        errors.push({
          errorId: `safety-delete-${task.taskId}`,
          category: 'SAFETY',
          description: `Task attempts to execute delete commands on project files.`,
          severity: 'CRITICAL',
          affectedTask: task.taskId,
          suggestedResolution: 'Modify task to disable destructive deletes commands.'
        });
      }
    }

    return errors;
  }
}

export const safetyValidator = new SafetyValidator();
export default safetyValidator;
