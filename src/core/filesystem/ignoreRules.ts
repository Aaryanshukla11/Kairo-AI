export const PROTECTED_DIRECTORIES = [
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
  '.cache'
];

/**
 * Checks if a path target is within any protected directory.
 */
export function isProtectedPath(filePath: string): boolean {
  const parts = filePath.split(/[/\\]/);
  return parts.some(part => PROTECTED_DIRECTORIES.includes(part));
}
