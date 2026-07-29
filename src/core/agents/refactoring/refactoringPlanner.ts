import { RefactorPlan, CodeSmell, RefactoringType } from './refactoringTypes';
import { refactoringStrategies } from './refactoringStrategies';

export class RefactoringPlanner {
  public buildPlan(smells: { smell: CodeSmell; file: string; description: string }[]): RefactorPlan[] {
    const plans: RefactorPlan[] = [];

    for (const item of smells) {
      const type = refactoringStrategies.mapSmellToStrategy(item.smell);
      let complexity: 'Low' | 'Medium' | 'High' = 'Low';

      if (type === RefactoringType.ExtractClass || type === RefactoringType.MergeDuplicates) {
        complexity = 'High';
      } else if (type === RefactoringType.ExtractMethod || type === RefactoringType.SimplifyLogic) {
        complexity = 'Medium';
      }

      plans.push({
        planId: `ref-plan-${Math.round(Math.random() * 100000)}`,
        targetFile: item.file,
        type,
        smell: item.smell,
        description: `Refactoring task recommending "${type}" to resolve ${item.smell} in ${item.file}`,
        complexity
      });
    }

    return plans;
  }
}

export const refactoringPlanner = new RefactoringPlanner();
