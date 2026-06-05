export class TokenPredictor {
  public predictCompletion(promptText: string, taskType: string): number {
    const promptLen = promptText.length;
    // Heuristic completion bounds predictions
    if (taskType.toLowerCase().includes('plan')) {
      return 1500;
    } else if (taskType.toLowerCase().includes('code')) {
      return 2048;
    } else if (taskType.toLowerCase().includes('review')) {
      return 800;
    }
    return 1024;
  }
}

export const tokenPredictor = new TokenPredictor();
