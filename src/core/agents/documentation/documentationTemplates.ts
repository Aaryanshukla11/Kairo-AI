import { DocType } from './documentationTypes';

export class DocumentationTemplates {
  public compile(templateId: string, payload: any): string {
    const title = payload.title || 'Project Documentation';
    const date = new Date().toLocaleDateString();

    switch (templateId.toLowerCase()) {
      case 'standard-readme':
        return `# ${title}\n\nGenerated on ${date}.\n\n## Overview\nProvide background context about the project module.\n\n## Features\n- Feature list items.`;
      case 'api-ref':
        return `# API Reference: ${title}\n\nGenerated on ${date}.\n\n## Endpoints & Hooks\nDetailed parameter structures are logged here.`;
      case 'arch-doc':
        return `# Architecture Document: ${title}\n\nGenerated on ${date}.\n\n## Design Topology\nVisual mappings and subsystem layouts details.`;
      case 'release-notes-template':
        return `# Release Notes: ${title}\n\nReleased on ${date}.\n\n## Changelog & Enhancements\nList details of changes implemented in this session.`;
      default:
        throw new Error(`Invalid template configuration: "${templateId}"`);
    }
  }
}

export const documentationTemplates = new DocumentationTemplates();
