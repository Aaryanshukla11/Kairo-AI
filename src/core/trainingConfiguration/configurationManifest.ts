import { TrainingConfigModel, ConfigManifestModel } from './configurationTypes';
import * as crypto from 'crypto';

export class ConfigurationManifest {
  public createManifest(config: TrainingConfigModel): ConfigManifestModel {
    const manifestId = `MAN-CFG-${config.configId}-${Date.now()}`;
    
    // Serialized config parameters to compute unique SHA-256 manifest hash
    const paramsStr = JSON.stringify(config);
    const checksum = 'sha256-' + crypto.createHash('sha256').update(paramsStr, 'utf8').digest('hex');

    return {
      manifestId,
      configId: config.configId,
      version: config.version,
      checksum,
      createdAt: Date.now()
    };
  }
}

export const configurationManifest = new ConfigurationManifest();
export default configurationManifest;
