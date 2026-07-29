import { AgentDefinition } from './agentTypes';

export class AgentValidator {
  /**
   * Asserts registry uniqueness and capability requirements.
   */
  public validateRegistration(agent: AgentDefinition, registered: Map<string, AgentDefinition>): void {
    if (!agent.id || !agent.id.trim()) {
      throw new Error('Agent validation error: Agent ID is required and cannot be empty');
    }
    if (registered.has(agent.id)) {
      throw new Error(`Agent validation error: Duplicate ID "${agent.id}" registered`);
    }
    if (!agent.capabilities || agent.capabilities.length === 0) {
      throw new Error(`Agent validation error: Agent "${agent.id}" must declare at least one capability`);
    }
  }

  /**
   * Asserts assignment matches capability.
   */
  public validateTaskAssignment(agent: AgentDefinition, requiredCapability: string): void {
    if (!agent.capabilities.includes(requiredCapability)) {
      throw new Error(`Agent validation error: Agent "${agent.id}" lacks required capability: "${requiredCapability}"`);
    }
  }
}

export const agentValidator = new AgentValidator();
