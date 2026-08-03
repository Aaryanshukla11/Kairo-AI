export class SemanticVersioning {
  public parse(version: string): { major: number; minor: number; patch: number } {
    const parts = version.replace(/^v/, '').split('.');
    return {
      major: parseInt(parts[0] || '1', 10),
      minor: parseInt(parts[1] || '0', 10),
      patch: parseInt(parts[2] || '0', 10)
    };
  }

  public incrementPatch(version: string): string {
    const p = this.parse(version);
    return `${p.major}.${p.minor}.${p.patch + 1}`;
  }

  public incrementMinor(version: string): string {
    const p = this.parse(version);
    return `${p.major}.${p.minor + 1}.0`;
  }

  public incrementMajor(version: string): string {
    const p = this.parse(version);
    return `${p.major + 1}.0.0`;
  }

  public isValid(version: string): boolean {
    return /^[vV]?\d+\.\d+\.\d+$/.test(version);
  }
}

export const semanticVersioning = new SemanticVersioning();
export default semanticVersioning;
