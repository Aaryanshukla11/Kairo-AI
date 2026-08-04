import { QuantizationType } from '../exportTypes';

export class SafetensorsExporter {
  public exportSafetensors(checkpointId: string, quant: QuantizationType): {
    fileName: string;
    fileSize: number;
    success: boolean;
  } {
    const fileName = `${checkpointId}_model.safetensors`;
    // Safetensors usually stores in unquantized half precision or fp32
    const multiplier = quant === 'bf16' || quant === 'fp16' ? 0.50 : 1.0;
    const fileSize = Math.floor(8030000000 * 2 * multiplier);

    return {
      fileName,
      fileSize,
      success: true
    };
  }
}

export const safetensorsExporter = new SafetensorsExporter();
export default safetensorsExporter;
