import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface RuntimeManifestModel {
  timestamp: number;
  environment: string;
  filesHash: Record<string, string>;
}

export class RuntimeManifest {
  public generate(baseDir: string = path.resolve(__dirname, '../../')): RuntimeManifestModel {
    const filesHash: Record<string, string> = {};
    const packagePath = path.join(baseDir, 'package.json');
    
    if (fs.existsSync(packagePath)) {
      const content = fs.readFileSync(packagePath, 'utf-8');
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      filesHash['package.json'] = hash;
    }

    return {
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || 'development',
      filesHash
    };
  }
}

export const runtimeManifest = new RuntimeManifest();
export default runtimeManifest;
