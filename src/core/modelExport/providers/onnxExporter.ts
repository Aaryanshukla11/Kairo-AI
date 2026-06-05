export class ONNXExporter {
  public exportONNX(checkpointId: string): {
    fileName: string;
    fileSize: number;
    success: boolean;
  } {
    const fileName = `${checkpointId}_graph.onnx`;
    // ONNX contains execution graphs
    const fileSize = Math.floor(8030000000 * 2 * 0.48);

    return {
      fileName,
      fileSize,
      success: true
    };
  }
}

export const onnxExporter = new ONNXExporter();
export default onnxExporter;
