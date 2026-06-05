export class MockExporter {
  public exportMock(checkpointId: string): {
    fileName: string;
    fileSize: number;
    success: boolean;
  } {
    const fileName = `${checkpointId}_mock_weights.bin`;
    const fileSize = 1024 * 1024 * 50; // 50MB mock file
    return {
      fileName,
      fileSize,
      success: true
    };
  }
}

export const mockExporter = new MockExporter();
export default mockExporter;
