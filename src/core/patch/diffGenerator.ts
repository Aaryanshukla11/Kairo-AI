/**
 * Generates a unified-style line-by-line diff between old and new strings.
 */
export function generateDiff(oldText: string, newText: string): string {
  const oldLines = (oldText || '').split(/\r?\n/);
  const newLines = (newText || '').split(/\r?\n/);
  const diffLines: string[] = [];

  let i = 0;
  let j = 0;

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length) {
      if (oldLines[i] === newLines[j]) {
        diffLines.push(`  ${oldLines[i]}`);
        i++;
        j++;
      } else {
        const nextMatchInNew = newLines.indexOf(oldLines[i], j);
        const nextMatchInOld = oldLines.indexOf(newLines[j], i);

        if (nextMatchInNew !== -1 && (nextMatchInOld === -1 || nextMatchInNew - j <= nextMatchInOld - i)) {
          for (let k = j; k < nextMatchInNew; k++) {
            diffLines.push(`+ ${newLines[k]}`);
          }
          j = nextMatchInNew;
        } else if (nextMatchInOld !== -1) {
          for (let k = i; k < nextMatchInOld; k++) {
            diffLines.push(`- ${oldLines[k]}`);
          }
          i = nextMatchInOld;
        } else {
          diffLines.push(`- ${oldLines[i]}`);
          diffLines.push(`+ ${newLines[j]}`);
          i++;
          j++;
        }
      }
    } else if (i < oldLines.length) {
      diffLines.push(`- ${oldLines[i]}`);
      i++;
    } else if (j < newLines.length) {
      diffLines.push(`+ ${newLines[j]}`);
      j++;
    }
  }

  return diffLines.join('\n');
}
