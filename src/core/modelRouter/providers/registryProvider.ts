export class RegistryProvider {
  public getCandidates(): string[] {
    return [
      'gpt-4o',
      'qwen2.5-coder:7b',
      'nomic-embed-text'
    ];
  }
}
