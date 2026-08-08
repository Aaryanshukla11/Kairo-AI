import { IEngineeringProfile } from '../schema';
import { IProjectIntelligence } from '../../project-intelligence';

export class ProjectProfileSelector {
  public selectProfile(
    projectName: string,
    intel: IProjectIntelligence
  ): IEngineeringProfile {
    
    let profileType: IEngineeringProfile['profileType'] = 'Startup';
    let architecturePattern = 'Modular Monolith';
    const securityStrategy = ['JWT Encryption', 'HTTPS enforced'];
    const performanceCaching = ['Memory Cache'];

    if (intel.domain === 'Healthcare') {
      profileType = 'Healthcare';
      architecturePattern = 'Clean Architecture';
      securityStrategy.push('Audit Logs', 'HIPAA compliance checks encryption');
      performanceCaching.push('Database Indexing');
    } else if (intel.complexity.projectComplexity > 75) {
      profileType = 'Enterprise';
      architecturePattern = 'Microservices';
      securityStrategy.push('OAuth2 Provider', 'Secret Vault');
      performanceCaching.push('Redis Cache', 'CDN compression');
    } else if (intel.complexity.projectComplexity < 40) {
      profileType = 'MVP';
      architecturePattern = 'Monolith';
    }

    return {
      projectName,
      profileType,
      architecturePattern,
      securityStrategy,
      performanceCaching
    };
  }
}

export const projectProfileSelector = new ProjectProfileSelector();
export default projectProfileSelector;
