import { SafeEditInput } from '../safeEditTypes';

export interface SafetyProvider {
  name: string;
  analyze(input: SafeEditInput): string[];
  validate(input: SafeEditInput): boolean;
  risk(input: SafeEditInput): number;
  recommendations(input: SafeEditInput): string[];
}
