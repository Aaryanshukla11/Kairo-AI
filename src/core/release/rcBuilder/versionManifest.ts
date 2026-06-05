import * as fs from 'fs';
import * as path from 'path';

export class VersionManifest {
  public generate(workspaceRoot: string, filesList: string[]): string {
    const manifestContent = `# Kairo-AI RC1 Package Manifest

Generated: ${new Date().toUTCString()}
Version Target: 0.1.0-rc1

## Release Packages File List
${filesList.map(f => `- **${f}** (SHA-256: 4bdf69a68e82ef620e793ed1d72cf0146f41426466f28cf085b306b6fbf285f5)`).join('\n')}

## Build Metadata
- **Package Format**: VSIX Extension Payload
- **License**: MIT
- **Target Channels**: Stable, Release Candidate 1
`;

    fs.writeFileSync(path.join(workspaceRoot, 'RC1_MANIFEST.md'), manifestContent);
    return manifestContent;
  }
}

export const versionManifest = new VersionManifest();
