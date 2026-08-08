import { IEnterpriseRequirement } from '../../requirement-schema';
import { IFeatureMetadata, IBusinessModule } from '../schemas';

export class FeatureAndModuleDetector {
  public detectFeatures(category: string, req: IEnterpriseRequirement): IFeatureMetadata[] {
    const features: IFeatureMetadata[] = [];

    // All corporate apps recommend auth
    features.push({
      name: 'Authentication',
      priority: 'MANDATORY',
      confidence: 100,
      dependency: [],
      complexity: 'MEDIUM'
    });

    if (category === 'Hospital Management') {
      features.push(
        {
          name: 'Scheduling',
          priority: 'MANDATORY',
          confidence: 95,
          dependency: ['Authentication'],
          complexity: 'HIGH'
        },
        {
          name: 'Admin Panel',
          priority: 'RECOMMENDED',
          confidence: 90,
          dependency: ['Authentication'],
          complexity: 'MEDIUM'
        }
      );
    } else if (category === 'Ecommerce') {
      features.push(
        {
          name: 'Payments',
          priority: 'MANDATORY',
          confidence: 100,
          dependency: ['Authentication'],
          complexity: 'HIGH'
        },
        {
          name: 'Search',
          priority: 'RECOMMENDED',
          confidence: 85,
          dependency: [],
          complexity: 'MEDIUM'
        }
      );
    }

    return features;
  }

  public detectModules(category: string): IBusinessModule[] {
    const modules: IBusinessModule[] = [];

    modules.push({
      name: 'User Management',
      purpose: 'Manage user logins, password profiles resets, and authentication roles memberships',
      dependencies: [],
      suggestedArchitecture: 'Layered Auth Router Service'
    });

    if (category === 'Hospital Management') {
      modules.push(
        {
          name: 'Appointments Scheduling',
          purpose: 'Coordinate consultant doctor calendars admissions and intake timeslots',
          dependencies: ['User Management'],
          suggestedArchitecture: 'Event-driven Calendar Planner'
        },
        {
          name: 'Billing & Invoicing',
          purpose: 'Issue patient invoice ledgers and handle medical insurance claims billing',
          dependencies: ['User Management'],
          suggestedArchitecture: 'Transactional Payments Ledger'
        }
      );
    } else if (category === 'Ecommerce') {
      modules.push(
        {
          name: 'Checkout & Payments',
          purpose: 'Process cart checkouts, connect gateway processors, and store order statuses',
          dependencies: ['User Management'],
          suggestedArchitecture: 'CQRS Orders Pipeline'
        }
      );
    }

    return modules;
  }
}

export const featureAndModuleDetector = new FeatureAndModuleDetector();
export default featureAndModuleDetector;
