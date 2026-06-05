import { DocPlan, DocStrategy, DocType } from './documentationTypes';

export class DocumentationPlanner {
  public plan(gitChanges: string[]): DocPlan {
    const affectedTypes: DocType[] = [];
    const filesToUpdate: string[] = [];
    let strategy = DocStrategy.TemplateBased;
    let impactDescription = 'Minor updates to documentation files.';

    if (gitChanges && gitChanges.length > 0) {
      strategy = DocStrategy.IncrementalUpdate;
      impactDescription = 'Incremental documentation update triggered by changes to source modules.';

      for (const change of gitChanges) {
        const lower = change.toLowerCase();
        if (lower.includes('src/core/agents/')) {
          affectedTypes.push(DocType.APIDocumentation);
          affectedTypes.push(DocType.ArchitectureDocumentation);
          filesToUpdate.push('docs/ARCHITECTURE.md');
        } else if (lower.includes('src/webview/') || lower.includes('components/')) {
          affectedTypes.push(DocType.UserGuide);
          filesToUpdate.push('docs/USER_GUIDE.md');
        } else if (lower.endsWith('.md')) {
          strategy = DocStrategy.SectionUpdate;
          affectedTypes.push(DocType.README);
          filesToUpdate.push(change);
        }
      }
    }

    if (affectedTypes.length === 0) {
      affectedTypes.push(DocType.README);
      filesToUpdate.push('README.md');
    }

    return {
      planId: `doc-plan-${Date.now()}`,
      strategy,
      affectedTypes: Array.from(new Set(affectedTypes)),
      impactDescription,
      filesToUpdate: Array.from(new Set(filesToUpdate))
    };
  }
}

export const documentationPlanner = new DocumentationPlanner();
