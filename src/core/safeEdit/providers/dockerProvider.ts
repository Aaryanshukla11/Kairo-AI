import { SafetyProvider } from './baseSafetyProvider';
import { SafeEditInput } from '../safeEditTypes';

export class DockerProvider implements SafetyProvider {
  public name = 'DockerSafetyProvider';
  public analyze(input: SafeEditInput): string[] {
    return [];
  }
  public validate(input: SafeEditInput): boolean {
    return true;
  }
  public risk(input: SafeEditInput): number {
    return 10;
  }
  public recommendations(input: SafeEditInput): string[] {
    return [];
  }
}
export const dockerProvider = new DockerProvider();
