import { CodeSmell, RefactoringType } from './refactoringTypes';

export class RefactoringStrategies {
  public mapSmellToStrategy(smell: CodeSmell): RefactoringType {
    switch (smell) {
      case CodeSmell.GodObject:
      case CodeSmell.LargeClass:
        return RefactoringType.ExtractClass;
      case CodeSmell.LongMethod:
        return RefactoringType.ExtractMethod;
      case CodeSmell.DeepNesting:
        return RefactoringType.SimplifyLogic;
      case CodeSmell.MagicNumbers:
        return RefactoringType.RenameSymbols;
      case CodeSmell.DuplicateCode:
        return RefactoringType.MergeDuplicates;
      case CodeSmell.CircularDependencies:
        return RefactoringType.DependencyCleanup;
      default:
        return RefactoringType.SimplifyLogic;
    }
  }
}

export const refactoringStrategies = new RefactoringStrategies();
