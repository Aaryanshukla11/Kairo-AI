export class RegistryProvider {
  public getCandidates(): string[] {
    return [
      'gemini-2.5-flash',
      'qwen2.5-coder:7b',
      'nomic-embed-text'
    ];
  }
}
