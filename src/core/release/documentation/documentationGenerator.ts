import * as fs from 'fs';
import * as path from 'path';
import { apiDocumentation } from './apiDocumentation';
import { architectureDocumentation } from './architectureDocumentation';
import { developerGuide } from './developerGuide';
import { installationGuide } from './installationGuide';
import { pluginGuide } from './pluginGuide';
import { runtimeGuide } from './runtimeGuide';
import { trainingGuide } from './trainingGuide';
import { troubleshootingGuide } from './troubleshootingGuide';

export class DocumentationGenerator {
  public generateAll(targetDir: string): void {
    // Write root documentation guides
    fs.writeFileSync(path.join(targetDir, 'DEVELOPER_GUIDE.md'), developerGuide.getContent());
    fs.writeFileSync(path.join(targetDir, 'INSTALLATION_GUIDE.md'), installationGuide.getContent());
    fs.writeFileSync(path.join(targetDir, 'API_DOCUMENTATION.md'), apiDocumentation.getContent());
    fs.writeFileSync(path.join(targetDir, 'ARCHITECTURE_DOCUMENTATION.md'), architectureDocumentation.getContent());
    fs.writeFileSync(path.join(targetDir, 'CONTRIBUTING.md'), this.getContributingContent());

    // Write sub-guides for reference inside output directory if needed
    const outputDocsSubdir = path.join(targetDir, 'docs');
    if (!fs.existsSync(outputDocsSubdir)) {
      fs.mkdirSync(outputDocsSubdir, { recursive: true });
    }
    fs.writeFileSync(path.join(outputDocsSubdir, 'plugins.md'), pluginGuide.getContent());
    fs.writeFileSync(path.join(outputDocsSubdir, 'runtime.md'), runtimeGuide.getContent());
    fs.writeFileSync(path.join(outputDocsSubdir, 'training.md'), trainingGuide.getContent());
    fs.writeFileSync(path.join(outputDocsSubdir, 'troubleshooting.md'), troubleshootingGuide.getContent());
  }

  private getContributingContent(): string {
    return `# Contributing to Kairo-AI

We welcome contributions from the community. Follow these standards to maintain high stability scores.

## Coding Standards
- **Strong Typing**: Avoid \`any\` wherever possible.
- **Module Boundaries**: Never leak execution code across layers.
- **Unit assertion tests**: Every new feature must be accompanied by full unit tests.
- **Safe Edit Protocol**: Modifications to core modules must pass Safe Edit validation blocks before merging.
`;
  }
}

export const documentationGenerator = new DocumentationGenerator();
