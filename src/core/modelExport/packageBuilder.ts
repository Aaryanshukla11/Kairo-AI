import { ExportFormat, QuantizationType } from './exportTypes';

export interface PackageLayout {
  packageName: string;
  files: { name: string; size: number; checksum: string }[];
  totalSize: number;
}

export class PackageBuilder {
  public buildPackageLayout(
    checkpointId: string,
    format: ExportFormat,
    quant: QuantizationType,
    weightsSize: number,
    weightsChecksum: string
  ): PackageLayout {
    const packageName = `${checkpointId}_export_${format}_${quant}.tar.gz`;
    const files = [
      { name: 'config.json', size: 1024 * 5, checksum: 'sha256-conf123' },
      { name: 'tokenizer.json', size: 1024 * 500, checksum: 'sha256-tok123' },
      { name: 'model_card.md', size: 1024 * 2, checksum: 'sha256-card123' }
    ];

    let weightsName = 'model.safetensors';
    if (format === 'gguf') weightsName = 'model.gguf';
    else if (format === 'onnx') weightsName = 'model.onnx';
    else if (format === 'pytorch') weightsName = 'pytorch_model.bin';

    files.push({
      name: weightsName,
      size: weightsSize,
      checksum: weightsChecksum
    });

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    return {
      packageName,
      files,
      totalSize
    };
  }
}

export const packageBuilder = new PackageBuilder();
export default packageBuilder;
