import { NormalizationSummary } from './cleaningTypes';

export class CleaningMetrics {
  private samplesProcessed = 0;
  private acceptedCount = 0;
  private rejectedCount = 0;
  private normalizations: NormalizationSummary = {
    utf8NormalizedCount: 0,
    lineEndingsNormalizedCount: 0,
    whitespaceNormalizedCount: 0,
    filenamesNormalizedCount: 0,
    languagesNormalizedCount: 0,
    metadataNormalizedCount: 0
  };

  public trackSample(isAccepted: boolean): void {
    this.samplesProcessed++;
    if (isAccepted) {
      this.acceptedCount++;
    } else {
      this.rejectedCount++;
    }
  }

  public trackNormalizations(applied: string[]): void {
    for (const norm of applied) {
      if (norm.includes('UTF-8')) {
        this.normalizations.utf8NormalizedCount++;
      }
      if (norm.includes('Whitespace')) {
        this.normalizations.whitespaceNormalizedCount++;
        this.normalizations.lineEndingsNormalizedCount++;
      }
      if (norm.includes('Language')) {
        this.normalizations.languagesNormalizedCount++;
      }
      if (norm.includes('Metadata') || norm.includes('Path')) {
        this.normalizations.metadataNormalizedCount++;
        this.normalizations.filenamesNormalizedCount++;
      }
    }
  }

  public getSummary() {
    return {
      samplesProcessed: this.samplesProcessed,
      acceptedCount: this.acceptedCount,
      rejectedCount: this.rejectedCount,
      normalizationSummary: { ...this.normalizations }
    };
  }

  public clear(): void {
    this.samplesProcessed = 0;
    this.acceptedCount = 0;
    this.rejectedCount = 0;
    this.normalizations = {
      utf8NormalizedCount: 0,
      lineEndingsNormalizedCount: 0,
      whitespaceNormalizedCount: 0,
      filenamesNormalizedCount: 0,
      languagesNormalizedCount: 0,
      metadataNormalizedCount: 0
    };
  }
}

export const cleaningMetrics = new CleaningMetrics();
