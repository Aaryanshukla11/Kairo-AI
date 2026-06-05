import { GenerationArtifact } from './generationTypes';

export class OutputAssembler {
  public assemble(artifact: GenerationArtifact): GenerationArtifact {
    // Inject headers/footers in the code output formats
    const assembledFiles = artifact.files.map(f => {
      return {
        ...f,
        content: `// Assembled Code Output\n${f.content}`
      };
    });

    return {
      ...artifact,
      files: assembledFiles
    };
  }
}

export const outputAssembler = new OutputAssembler();
