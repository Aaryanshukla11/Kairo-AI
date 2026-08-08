import * as crypto from 'crypto';

export class CodeGenUtils {
  public static generateId(): string {
    return crypto.randomUUID();
  }

  public static calculateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  public static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
export default CodeGenUtils;
