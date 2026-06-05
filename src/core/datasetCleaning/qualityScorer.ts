import { CollectedFileItem } from '../datasetCollector/collectorTypes';

export interface QualityBreakdown {
  syntaxValidity: number;
  metadataCompleteness: number;
  formattingConsistency: number;
  encodingQuality: number;
  documentationQuality: number;
  sampleCompleteness: number;
  languageConfidence: number;
  complexity: number;
}

export class QualityScorer {
  public evaluateQuality(sample: CollectedFileItem): { overallScore: number; breakdown: QualityBreakdown } {
    const breakdown = this.calculateBreakdown(sample);
    
    // Weighted overall score calculation
    const overallScore = Math.round(
      breakdown.syntaxValidity * 0.20 +
      breakdown.metadataCompleteness * 0.15 +
      breakdown.formattingConsistency * 0.10 +
      breakdown.encodingQuality * 0.15 +
      breakdown.documentationQuality * 0.10 +
      breakdown.sampleCompleteness * 0.10 +
      breakdown.languageConfidence * 0.10 +
      breakdown.complexity * 0.10
    );

    return {
      overallScore,
      breakdown
    };
  }

  private calculateBreakdown(sample: CollectedFileItem): QualityBreakdown {
    const content = sample.content || '';
    const ext = (sample.filePath || '').split('.').pop()?.toLowerCase();

    // 1. Syntax Validity
    let syntaxValidity = 100;
    if (ext === 'json') {
      try {
        JSON.parse(content);
      } catch {
        syntaxValidity = 30; // Syntax failure
      }
    } else if (ext === 'ts' || ext === 'js') {
      // Basic check: matching braces count
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        syntaxValidity = 60;
      }
    }

    // 2. Metadata Completeness
    let metadataCompleteness = 100;
    const prov = sample.provenance;
    if (!prov) {
      metadataCompleteness = 0;
    } else {
      let missingFields = 0;
      const criticalFields = ['sampleId', 'datasetId', 'filePath', 'checksum', 'language', 'license'];
      for (const field of criticalFields) {
        if (!prov[field as keyof typeof prov]) {
          missingFields++;
        }
      }
      metadataCompleteness = Math.max(0, 100 - (missingFields * 16));
    }

    // 3. Formatting Consistency
    let formattingConsistency = 100;
    // Check if CRLF line endings are mixed with LF or if lines have trailing spaces
    const hasCrlf = content.includes('\r\n');
    const hasLf = content.includes('\n') && !hasCrlf;
    if (hasCrlf && content.split('\r\n').some(line => line.includes('\n'))) {
      formattingConsistency -= 20; // mixed newlines
    }
    if (content.split('\n').some(line => line !== line.trimEnd())) {
      formattingConsistency -= 10; // trailing spaces
    }

    // 4. Encoding Quality
    let encodingQuality = 100;
    const replacementCount = (content.match(/\uFFFD/g) || []).length;
    if (replacementCount > 0) {
      encodingQuality = Math.max(10, 100 - (replacementCount * 5));
    }

    // 5. Documentation Quality (comments ratio for code, headers ratio for md)
    let documentationQuality = 70;
    if (ext === 'md' || ext === 'markdown') {
      const headers = (content.match(/^#{1,6}\s/gm) || []).length;
      documentationQuality = headers > 0 ? 100 : 50;
    } else if (['ts', 'js', 'py', 'java', 'go', 'rs', 'cpp'].includes(ext || '')) {
      const lineCount = content.split('\n').length;
      const comments = (content.match(/\/\/|#|\/\*/g) || []).length;
      if (lineCount > 5) {
        const ratio = comments / lineCount;
        documentationQuality = Math.min(100, Math.round(ratio * 200 + 40));
      }
    }

    // 6. Sample Completeness
    let sampleCompleteness = 100;
    if (content.length < 50) {
      sampleCompleteness = 40;
    } else if (content.length < 200) {
      sampleCompleteness = 70;
    }

    // 7. Language Confidence
    let languageConfidence = 100;
    if (!sample.provenance?.language || sample.provenance.language === 'Unknown') {
      languageConfidence = 30;
    }

    // 8. Complexity
    let complexity = 50;
    const lineCount = content.split('\n').length;
    if (lineCount > 100) {
      complexity = 90;
    } else if (lineCount > 20) {
      complexity = 75;
    } else if (lineCount > 5) {
      complexity = 50;
    } else {
      complexity = 20;
    }

    return {
      syntaxValidity,
      metadataCompleteness,
      formattingConsistency,
      encodingQuality,
      documentationQuality,
      sampleCompleteness,
      languageConfidence,
      complexity
    };
  }
}

export const qualityScorer = new QualityScorer();
