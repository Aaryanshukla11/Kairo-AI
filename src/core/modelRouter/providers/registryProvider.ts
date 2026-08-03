export class RegistryProvider {
  public getCandidates(): string[] {
    return [
      'qwen-2.5-7b-coder',
      'deepseek-reasoning-8b',
      'llama-3-8b-instruct'
    ];
  }
}
