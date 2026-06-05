export class EditMatcher {
  public matchLines(content: string, targetLine: string): number {
    const lines = content.split('\n');
    return lines.findIndex(l => l.includes(targetLine));
  }
}

export const editMatcher = new EditMatcher();
