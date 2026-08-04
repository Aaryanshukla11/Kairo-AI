import * as crypto from 'crypto';

export class ChecksumManager {
  public generateHash(content: string): string {
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    return `sha256-${hash}`;
  }

  public verifyHash(content: string, expectedHash: string): boolean {
    const calculated = this.generateHash(content);
    return calculated === expectedHash;
  }
}

export const checksumManager = new ChecksumManager();
export default checksumManager;
