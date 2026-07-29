import { SafeEditInput } from '../safeEditTypes';

export class FilesystemSafety {
  public name = 'FilesystemSafetyStrategy';

  public check(input: SafeEditInput): { blocking: string[]; warnings: string[] } {
    const blocking: string[] = [];
    const warnings: string[] = [];
    const content = input.patchContent;

    // Check for unsafe delete operations
    if (content.includes('rm -rf') || content.includes('fs.unlink') || content.includes('fs.rmSync') || content.includes('fs.promises.unlink')) {
      blocking.push('FS-01: Contains unsafe file deletion patterns');
    }

    // Check if modifying critical system files or config files outside workspace
    if (input.targetFile.includes('.env') || input.targetFile.includes('tsconfig.json') || input.targetFile.includes('package-lock.json')) {
      warnings.push('FS-02: Modify attempt on a critical configuration file');
    }

    // Manifest files check
    if (input.patchManifest) {
      for (const f of input.patchManifest.files) {
        if (f.type === 'delete') {
          blocking.push(`FS-03: Attempt to delete file: ${f.path}`);
        }
      }
    }

    return { blocking, warnings };
  }
}

export const filesystemSafety = new FilesystemSafety();
