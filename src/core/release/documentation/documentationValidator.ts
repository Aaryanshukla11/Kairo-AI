import * as fs from 'fs';
import * as path from 'path';

export class DocumentationValidator {
  public validateDocs(baseDir: string): {
    score: number;
    passed: boolean;
    brokenLinks: string[];
    missingSections: string[];
  } {
    const brokenLinks: string[] = [];
    const missingSections: string[] = [];
    let score = 100;

    // Check presence of core guides in directory
    const requiredDocs = [
      'DEVELOPER_GUIDE.md',
      'INSTALLATION_GUIDE.md',
      'CONTRIBUTING.md',
      'API_DOCUMENTATION.md',
      'ARCHITECTURE_DOCUMENTATION.md'
    ];

    for (const doc of requiredDocs) {
      const docPath = path.join(baseDir, doc);
      if (!fs.existsSync(docPath)) {
        score -= 20;
        missingSections.push(`Missing documentation guide file: ${doc}`);
      } else {
        const content = fs.readFileSync(docPath, 'utf-8');
        // Simple regex check for invalid local file links
        const linkRegex = /\[.*?\]\((file:\/\/\/.*?)\)/g;
        let match;
        while ((match = linkRegex.exec(content)) !== null) {
          const fileUri = match[1];
          const cleanPath = fileUri.replace('file:///', '').replace(/\//g, path.sep);
          // Only validate if it points to desktop workspace paths
          if (cleanPath.includes('Kairo-AI') && !fs.existsSync(cleanPath.split('#')[0])) {
            brokenLinks.push(`Broken Link inside ${doc}: ${fileUri}`);
            score -= 5;
          }
        }
      }
    }

    score = Math.max(0, score);

    return {
      score,
      passed: score >= 90,
      brokenLinks,
      missingSections
    };
  }
}

export const documentationValidator = new DocumentationValidator();
