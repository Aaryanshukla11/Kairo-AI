export const IGNORE_DIRECTORIES = [
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git',
  '.next',
  'out',
  '.cache',
  'tmp'
];

/**
 * Checks if a given path or file name is in the ignore list.
 */
export function isIgnored(pathOrFilename: string): boolean {
  const parts = pathOrFilename.split(/[/\\]/);
  return parts.some(part => IGNORE_DIRECTORIES.includes(part));
}
