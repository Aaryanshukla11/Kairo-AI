export class HuggingFaceExporter {
  public exportHF(checkpointId: string): {
    fileName: string;
    fileSize: number;
    success: boolean;
    repoUrl: string;
  } {
    const fileName = `${checkpointId}_hf_package.tar.gz`;
    const fileSize = Math.floor(8030000000 * 2 * 0.45);
    const repoUrl = `https://huggingface.co/kairo-ai/exported-${checkpointId}`;

    return {
      fileName,
      fileSize,
      success: true,
      repoUrl
    };
  }
}

export const huggingFaceExporter = new HuggingFaceExporter();
export default huggingFaceExporter;
