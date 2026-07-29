export const SUPPORTED_BASE_COMMANDS = [
  'pwd',
  'ls',
  'dir',
  'npm',
  'pnpm',
  'yarn',
  'node',
  'npx',
  'git',
  'python'
];

/**
 * Checks if a command is in the V1 whitelist.
 */
export function isWhitelistedCommand(commandLine: string): boolean {
  const trimmed = commandLine.trim();
  if (!trimmed) return false;

  const parts = trimmed.split(/\s+/);
  const baseCmd = parts[0];

  // Specific check for python --version
  if (baseCmd === 'python') {
    return trimmed === 'python --version' || parts.includes('--version');
  }

  // Check npm / pnpm / yarn whitelist restrictions
  if (baseCmd === 'npm') {
    const sub = parts[1];
    return sub === 'install' || sub === 'run' || (parts.length > 2 && parts.includes('run'));
  }

  if (baseCmd === 'git') {
    const sub = parts[1];
    return ['status', 'diff', 'branch'].includes(sub);
  }

  return SUPPORTED_BASE_COMMANDS.includes(baseCmd);
}
