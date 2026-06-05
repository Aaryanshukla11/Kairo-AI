import { IEnterpriseRequirement } from '../../requirement-schema';
import { IScalabilityEstimation } from '../schemas';

export class DomainAndScalabilityAnalyzer {
  public analyzeDomain(category: string): string {
    switch (category) {
      case 'Hospital Management':
        return 'Healthcare';
      case 'Streaming Platform':
        return 'Entertainment';
      case 'Ecommerce':
        return 'Retail';
      case 'CRM':
        return 'Business Operations';
      case 'Chat Application':
        return 'Communication';
      default:
        return 'Technology';
    }
  }

  public analyzeScalability(category: string): IScalabilityEstimation {
    switch (category) {
      case 'Streaming Platform':
        return {
          expectedUsers: '100k+ concurrent users',
          expectedTraffic: 'High bandwidth video streaming',
          dataVolume: 'Terabytes of media uploads',
          scalingRequirements: ['CDN caching layers', 'Auto-scaling stateless clusters', 'Horizontal read replicas']
        };
      case 'Ecommerce':
        return {
          expectedUsers: '10k+ daily shoppers',
          expectedTraffic: 'Spiky checkout traffic patterns',
          dataVolume: 'Gigabytes of catalog product database logs',
          scalingRequirements: ['Database caching filters', 'Read replicas scaling', 'Distributed queue scheduling']
        };
      default:
        return {
          expectedUsers: 'Internal team usage',
          expectedTraffic: 'Consistent low latency operations',
          dataVolume: 'Megabytes of operational records',
          scalingRequirements: ['Standard horizontal docker pods replication']
        };
    }
  }
}

export const domainAndScalabilityAnalyzer = new DomainAndScalabilityAnalyzer();
export default domainAndScalabilityAnalyzer;
