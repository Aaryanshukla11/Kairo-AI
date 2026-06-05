export class PatchNormalizer {
  public normalize(path: string): string {
    return path.replace(/\\/g, '/');
  }
}

export const patchNormalizer = new PatchNormalizer();
