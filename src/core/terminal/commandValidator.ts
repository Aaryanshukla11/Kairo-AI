import * as path from 'path';
import { isWhitelistedCommand } from './commandWhitelist';

export const BLOCKED_KEYWORDS = [
  'rm -rf',
  'sudo',
  'shutdown',
  'reboot',
  'mkfs',
  'format',
  'diskpart'
];

export class CommandValidator {
  /**
   * Validates safety boundaries, paths, and whitelist parameters of a command.
   */
  public validate(command: string, workingDirectory: string, workspaceRoot: string): void {
    const trimmed = command.trim();
    if (!trimmed) {
      throw new Error('Command execution rejected: Command is empty');
    }

    const lower = trimmed.toLowerCase();
    for (const keyword of BLOCKED_KEYWORDS) {
      if (lower.includes(keyword)) {
        throw new Error(`Command execution rejected: Command contains blocked keyword "${keyword}"`);
      }
    }

    if (lower.includes('powershell') && (lower.includes('runas') || lower.includes('-verb'))) {
      throw new Error('Command execution rejected: Elevated privilege execution is blocked');
    }

    const resolvedWD = path.resolve(workingDirectory);
    const resolvedWR = path.resolve(workspaceRoot);
    const relative = path.relative(resolvedWR, resolvedWD);
    if (relative.startsWith('..') && !path.isAbsolute(relative)) {
      throw new Error(`Command execution rejected: Working directory "${workingDirectory}" is outside workspace root`);
    }

    if (!isWhitelistedCommand(trimmed)) {
      throw new Error(`Command execution rejected: Command "${trimmed}" is not in the allowed V1 whitelist`);
    }
  }
}

export const commandValidator = new CommandValidator();
