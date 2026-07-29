import { randomUUID } from 'crypto';
import { ProjectContext, ContextWorkspaceInfo, ContextSelectionInfo, ContextPlannerInfo, ContextExecutionInfo, ContextGitInfo } from './contextTypes';
import { contextResolver } from './contextResolver';
import { contextSelector } from './contextSelector';
import { Diagnostic } from '../diagnostics/diagnosticsTypes';

export class ContextBuilder {
  /**
   * Compiles diagnostic list, git status, planners, and resolved file sets into ProjectContext.
   */
  public build(params: {
    rootPath: string;
    filePaths: string[];
    selection: ContextSelectionInfo;
    planner: ContextPlannerInfo;
    execution: ContextExecutionInfo;
    git: ContextGitInfo;
    diagnostics: Diagnostic[];
    limitBytes?: number;
  }): ProjectContext {
    const limit = params.limitBytes || 500 * 1024;

    const hasGit = require('fs').existsSync(require('path').join(params.rootPath, '.git'));
    const packageJson = contextResolver.resolvePackageJson(params.rootPath);
    const workspace: ContextWorkspaceInfo = {
      rootPath: params.rootPath,
      projectName: packageJson?.name || require('path').basename(params.rootPath),
      packageJson,
      hasGit
    };

    const resolved = contextResolver.resolveFiles(params.rootPath, params.filePaths);
    const files = contextSelector.selectUnderLimit(resolved, limit);

    const sizeBytesTotal = files.reduce((acc, f) => acc + f.size, 0);
    const tokenEstimateTotal = files.reduce((acc, f) => acc + f.tokenEstimate, 0);

    return {
      id: randomUUID(),
      workspace,
      files,
      selection: params.selection,
      planner: params.planner,
      execution: params.execution,
      git: params.git,
      diagnostics: params.diagnostics,
      metadata: {
        tokenEstimateTotal,
        sizeBytesTotal,
        limitBytes: limit
      },
      timestamp: Date.now()
    };
  }
}

export const contextBuilder = new ContextBuilder();
