import { WorkspaceSnapshot } from './WorkspaceSnapshot';
import { ProjectInfo } from '../../common/workspace';

export class WorkspaceAnalyzer {
  /**
   * Generates a high-level summary of the workspace based on the snapshot.
   * Note: This does not execute code analysis.
   */
  public static analyze(snapshot: WorkspaceSnapshot): ProjectInfo {
    let estimatedSize = 0;
    
    for (const file of snapshot.files) {
      estimatedSize += file.size;
    }

    return {
      type: snapshot.framework === 'Unknown' ? 'Generic' : 'Web App',
      framework: snapshot.framework,
      languages: snapshot.languages,
      estimatedSize
    };
  }
}
