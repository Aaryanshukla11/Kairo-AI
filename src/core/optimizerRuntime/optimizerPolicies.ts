import { OptimizerStateModel, OptimizerPolicyConfig } from './optimizerTypes';

export class OptimizerPolicies {
  public applyPolicy(
    state: OptimizerStateModel,
    policy: OptimizerPolicyConfig
  ): void {
    if (policy.weightDecayPolicy === 'Decoupled' && state.optimizerType === 'Adam') {
      // Force change Adam to AdamW if decoupled weight decay is requested
      state.optimizerType = 'AdamW';
    } else if (policy.weightDecayPolicy === 'None') {
      state.weightDecay = 0.0;
    }
  }
}

export const optimizerPolicies = new OptimizerPolicies();
export default optimizerPolicies;
