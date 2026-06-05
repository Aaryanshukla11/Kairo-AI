import { QLoRAConfig } from './fineTuningTypes';

export class QLoRAManager {
  public createDefaultConfig(): QLoRAConfig {
    return {
      r: 8,
      alpha: 16,
      dropout: 0.05,
      targetModules: ['q_proj', 'v_proj', 'k_proj', 'o_proj'],
      bias: 'none',
      quantType: 'nf4',
      doubleQuant: true,
      computeDtype: 'fp16'
    };
  }

  public validateConfig(config: QLoRAConfig): boolean {
    if (config.r <= 0 || config.r > 512) return false;
    if (config.alpha <= 0) return false;
    if (config.dropout < 0 || config.dropout >= 1) return false;
    if (config.quantType !== 'nf4' && config.quantType !== 'fp4') return false;
    if (config.computeDtype !== 'fp16' && config.computeDtype !== 'bf16' && config.computeDtype !== 'fp32') return false;
    return true;
  }
}

export const qloraManager = new QLoRAManager();
export default qloraManager;
