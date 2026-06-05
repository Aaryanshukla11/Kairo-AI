import { LoRAConfig } from './fineTuningTypes';

export class LoRAManager {
  public createDefaultConfig(): LoRAConfig {
    return {
      r: 8,
      alpha: 16,
      dropout: 0.05,
      targetModules: ['q_proj', 'v_proj'],
      bias: 'none'
    };
  }

  public validateConfig(config: LoRAConfig): boolean {
    if (config.r <= 0 || config.r > 512) return false;
    if (config.alpha <= 0) return false;
    if (config.dropout < 0 || config.dropout >= 1) return false;
    if (!config.targetModules || config.targetModules.length === 0) return false;
    return true;
  }
}

export const loraManager = new LoRAManager();
export default loraManager;
