import { DocType } from './documentationTypes';

export class DocumentationValidator {
  public validateWorkspace(folders: any[] | undefined): void {
    if (!folders || folders.length === 0) {
      throw new Error('Documentation validation error: Missing project. No active workspace folder found.');
    }
  }

  public validateTemplate(templateId: string): void {
    const supported = ['standard-readme', 'api-ref', 'arch-doc', 'release-notes-template'];
    if (!supported.includes(templateId.toLowerCase())) {
      throw new Error(`Documentation validation error: Invalid template configuration "${templateId}"`);
    }
  }

  public validateDocType(docType: DocType): void {
    const values = Object.values(DocType);
    if (!values.includes(docType)) {
      throw new Error(`Documentation validation error: Unknown document type "${docType}"`);
    }
  }

  public validateLinks(path: string, content: string): string[] {
    const warnings: string[] = [];
    const linkRegex = /\[[^\]]+\]\((file:\/\/\/[^\)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const url = match[1];
      if (url.includes('//undefined') || url.includes('/null')) {
        warnings.push(`Broken reference link detected: "${url}" inside ${path}`);
      }
    }

    return warnings;
  }
}

export const documentationValidator = new DocumentationValidator();
