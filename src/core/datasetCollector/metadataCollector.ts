import { CollectedFileItem, LicenseReport } from './collectorTypes';

export class MetadataCollector {
  public collectMetadata(files: CollectedFileItem[]): {
    languagesDistribution: Record<string, number>;
    licensesDistribution: Record<string, number>;
    sourceSummary: Record<string, number>;
    totalFiles: number;
    totalBytes: number;
    avgSizeBytes: number;
  } {
    const languages: Record<string, number> = {};
    const licenses: Record<string, number> = {};
    const sources: Record<string, number> = {};
    let totalBytes = 0;

    for (const file of files) {
      const lang = file.provenance.language || 'Unknown';
      const lic = file.provenance.license || 'Unknown';
      const srcType = file.provenance.sourceType || 'Unknown';

      languages[lang] = (languages[lang] || 0) + 1;
      licenses[lic] = (licenses[lic] || 0) + 1;
      sources[srcType] = (sources[srcType] || 0) + 1;
      totalBytes += file.sizeBytes || 0;
    }

    const totalFiles = files.length;
    const avgSizeBytes = totalFiles > 0 ? Math.round(totalBytes / totalFiles) : 0;

    return {
      languagesDistribution: languages,
      licensesDistribution: licenses,
      sourceSummary: sources,
      totalFiles,
      totalBytes,
      avgSizeBytes
    };
  }

  public generateLicenseReport(files: CollectedFileItem[]): LicenseReport {
    const meta = this.collectMetadata(files);
    const unknownCount = meta.licensesDistribution['Unknown'] || 0;
    const permissibleLicenses = ['MIT', 'Apache-2.0', 'BSD', 'ISC', 'Creative-Commons', 'Unlicense'];
    
    let permissibleCount = 0;
    for (const [lic, count] of Object.entries(meta.licensesDistribution)) {
      if (permissibleLicenses.includes(lic)) {
        permissibleCount += count;
      }
    }

    return {
      timestamp: Date.now(),
      totalFiles: files.length,
      detectedLicenses: meta.licensesDistribution,
      unknownCount,
      permissibleCount
    };
  }
}

export const metadataCollector = new MetadataCollector();
