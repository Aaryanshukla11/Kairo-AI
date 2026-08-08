import { IPriorityRequirement, PriorityLevel } from './types';
import { IPromptContext } from '../prompt-context-builder/types';

export class PrioritySystem {
  public assignPriorities(context: IPromptContext): IPriorityRequirement[] {
    const requirements: IPriorityRequirement[] = [];

    // Assign technology priorities
    const tech = context.detectedTechnologies;
    
    if (tech.language) {
      requirements.push({ name: tech.language, category: 'technology', priority: 'CRITICAL' });
    }
    if (tech.frontend) {
      requirements.push({ name: tech.frontend, category: 'technology', priority: 'CRITICAL' });
    }
    if (tech.backend) {
      requirements.push({ name: tech.backend, category: 'technology', priority: 'CRITICAL' });
    }
    if (tech.database) {
      requirements.push({ name: tech.database, category: 'technology', priority: 'CRITICAL' });
    }
    if (tech.authMethod) {
      requirements.push({ name: tech.authMethod, category: 'technology', priority: 'HIGH' });
    }
    if (tech.apiStyle) {
      requirements.push({ name: tech.apiStyle, category: 'technology', priority: 'HIGH' });
    }
    if (tech.uiFramework) {
      requirements.push({ name: tech.uiFramework, category: 'technology', priority: 'LOW' });
    }
    if (tech.cssFramework) {
      requirements.push({ name: tech.cssFramework, category: 'technology', priority: 'LOW' });
    }
    if (tech.stateManagement) {
      requirements.push({ name: tech.stateManagement, category: 'technology', priority: 'MEDIUM' });
    }
    if (tech.buildTool) {
      requirements.push({ name: tech.buildTool, category: 'technology', priority: 'MEDIUM' });
    }

    // Assign features priorities
    for (const feature of context.detectedFeatures) {
      requirements.push({
        name: feature,
        category: 'feature',
        priority: this.evaluateFeaturePriority(feature)
      });
    }

    return requirements;
  }

  private evaluateFeaturePriority(feature: string): PriorityLevel {
    const criticalSet = new Set(['Authentication', 'Authorization', 'Payments']);
    const highSet = new Set(['User Management', 'Chat', 'Database Sync', 'Security Gates']);
    const mediumSet = new Set(['Calendar', 'Maps', 'File Upload', 'Image Upload', 'Search', 'Analytics', 'Reporting']);
    
    if (criticalSet.has(feature)) return 'CRITICAL';
    if (highSet.has(feature)) return 'HIGH';
    if (mediumSet.has(feature)) return 'MEDIUM';
    return 'LOW';
  }
}

export const prioritySystem = new PrioritySystem();
export default prioritySystem;
