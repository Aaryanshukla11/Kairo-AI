import * as fs from 'fs';
import * as path from 'path';

export class PackageBuilder {
  public buildPackage(baseDir: string, filesList: string[]): { packagePath: string; totalFiles: number } {
    const buildFolder = path.join(baseDir, 'dist', 'release');
    if (!fs.existsSync(buildFolder)) {
      fs.mkdirSync(buildFolder, { recursive: true });
    }

    const packagePath = path.join(buildFolder, 'kairo-ai-rc1.zip');
    
    // Write mock package bytes
    fs.writeFileSync(packagePath, 'MOCK_ZIP_PACKAGE_CONTENTS_KAIRO_AI_RELEASE_CANDIDATE_1');

    return {
      packagePath,
      totalFiles: filesList.length
    };
  }
}

export const packageBuilder = new PackageBuilder();
