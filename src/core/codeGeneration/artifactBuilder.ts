import { GenerationArtifact, GeneratedFile, GenerationStrategy } from './generationTypes';

export class ArtifactBuilder {
  public buildArtifact(
    files: GeneratedFile[],
    strategy: GenerationStrategy,
    durationMs: number
  ): GenerationArtifact {
    let totalLines = 0;
    for (const f of files) {
      totalLines += f.content.split('\n').length;
    }

    return {
      generationId: `gen-art-${Date.now()}`,
      files,
      strategyUsed: strategy,
      summary: `Successfully generated ${files.length} code files containing class/interface symbols.`,
      warnings: [],
      metrics: {
        durationMs,
        linesCount: totalLines,
        filesCount: files.length
      }
    };
  }
}

export const artifactBuilder = new ArtifactBuilder();
