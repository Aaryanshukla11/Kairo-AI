import { documentationPlanner } from './documentationPlanner';
import { documentationGenerator } from './documentationGenerator';
import { documentationValidator } from './documentationValidator';
import { documentationMetrics } from './documentationMetrics';
import { DocumentationEvents } from './documentationEvents';
import { DocReport, DocEventType } from './documentationTypes';
import * as vscode from 'vscode';

export class DocumentationBrain {
  constructor(private events: DocumentationEvents) {}

  public async runDocumentationWorkflow(gitChanges: string[]): Promise<DocReport> {
    const folders = vscode.workspace.workspaceFolders;
    documentationValidator.validateWorkspace(folders as any);

    this.events.emit(DocEventType.DocumentationStarted, { gitChanges });

    // 1. Plan Strategy
    const docPlan = documentationPlanner.plan(gitChanges);

    // 2. Validate plans docTypes
    for (const type of docPlan.affectedTypes) {
      documentationValidator.validateDocType(type);
    }

    // 3. Generate Docs
    const report = documentationGenerator.generate(docPlan);
    
    for (const doc of report.generatedDocuments) {
      this.events.emit(DocEventType.DocumentGenerated, { path: doc.path, type: doc.type });
    }

    for (const file of report.updatedFiles) {
      this.events.emit(DocEventType.DocumentUpdated, { path: file });
    }

    this.events.emit(DocEventType.ValidationPassed, { warningsCount: report.warnings.length });

    documentationMetrics.recordGeneration(
      report.updatedFiles.length,
      report.generatedDocuments.length,
      report.warnings.length,
      report.coverage
    );

    this.events.emit(DocEventType.DocumentationCompleted, { report });

    return report;
  }
}
