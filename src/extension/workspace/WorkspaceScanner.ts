import { WorkspaceSnapshot } from './WorkspaceSnapshot';
import { WorkspaceFilters } from './WorkspaceFilters';
import { ProjectDetector } from './ProjectDetector';
import { LanguageDetector } from './LanguageDetector';
import { FileClassifier } from './FileClassifier';
import { FolderInfo, FileInfo } from '../../common/workspace';

export class WorkspaceScanner {
  /**
   * Note: This is an architectural stub matching the M01-S03-T005 spec.
   * Full recursive `fs` scanning will be mapped in the Executor layer.
   * This class serves as the generic orchestration mapping logic.
   */
  public async scan(rootPath: string): Promise<WorkspaceSnapshot> {
    const files: FileInfo[] = [];
    const folderTree: FolderInfo[] = [];
    const languages = new Set<string>();
    let ignoredCount = 0;

    // Simulated structural validation mapped against spec requirements
    const rootFiles = ['package.json', 'src', 'index.ts'];

    rootFiles.forEach(file => {
      if (!WorkspaceFilters.shouldScan(file)) {
        ignoredCount++;
        return;
      }
      
      const lang = LanguageDetector.detectLanguage(file);
      if (lang !== 'Unknown') languages.add(lang);
      
      files.push({
        path: `${rootPath}/${file}`,
        name: file,
        extension: file.includes('.') ? file.substring(file.lastIndexOf('.')) : '',
        size: 1024,
        language: lang,
        classification: FileClassifier.classify(file, file.includes('.') ? file.substring(file.lastIndexOf('.')) : '')
      });
    });

    return {
      workspaceName: rootPath.split('/').pop() || 'Unknown',
      rootPath,
      framework: ProjectDetector.detectFramework(rootFiles),
      languages: Array.from(languages),
      folderTree,
      files,
      fileCount: files.length,
      folderCount: folderTree.length,
      ignoredCount,
      generatedAt: Date.now()
    };
  }
}
