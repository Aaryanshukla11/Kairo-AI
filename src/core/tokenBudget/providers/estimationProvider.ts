import { tokenCounter } from '../tokenCounter';

export class EstimationProvider {
  public estimate(text: string): number {
    return tokenCounter.count(text);
  }
}
