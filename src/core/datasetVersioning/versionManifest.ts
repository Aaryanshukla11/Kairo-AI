import { CleanedSample } from '../datasetCleaning/cleaningTypes';
import { VersionManifestModel } from './versionTypes';
import { manifestProvider } from './providers/manifestProvider';

export class VersionManifest {
  public createManifest(
    datasetId: string,
    version: string,
    checksum: string,
    samples: CleanedSample[],
    tokenEstimate: number
  ): VersionManifestModel {
    const manifestId = `VER-MAN-${datasetId}-${version}-${Date.now()}`;
    const checksumsMap: Record<string, string> = {};

    for (const sample of samples) {
      if (sample.filePath && sample.provenance?.checksum) {
        checksumsMap[sample.filePath] = sample.provenance.checksum;
      }
    }

    const manifest: VersionManifestModel = {
      manifestId,
      datasetId,
      version,
      creationTime: Date.now(),
      checksum,
      sampleCount: samples.length,
      tokenEstimate,
      checksumsMap
    };

    manifestProvider.saveManifest(manifest);
    return manifest;
  }

  public getManifest(datasetId: string, version: string): VersionManifestModel | undefined {
    return manifestProvider.getManifest(datasetId, version);
  }
}

export const versionManifest = new VersionManifest();
export default versionManifest;
