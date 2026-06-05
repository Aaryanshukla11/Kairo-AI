import { ExportManifest, ExportFormat, QuantizationType } from './exportTypes';
import * as crypto from 'crypto';

export class ExportManifestBuilder {
  public createManifest(
    exportId: string,
    format: ExportFormat,
    quantization: QuantizationType,
    fileList: { filename: string; size: number; checksum: string }[]
  ): ExportManifest {
    const serialized = JSON.stringify({ exportId, format, quantization, fileList });
    const hash = crypto.createHash('sha256').update(serialized).digest('hex');

    return {
      exportId,
      format,
      quantization,
      fileList,
      checksum: `sha256-${hash}`,
      timestamp: Date.now()
    };
  }
}

export const exportManifest = new ExportManifestBuilder();
export default exportManifest;
