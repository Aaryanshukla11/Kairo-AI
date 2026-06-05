import { IModuleMetadata } from '../schema';
import { IEngineeringDecision } from '../../engineering-decision';

export class ModuleDesigner {
  public designModules(decision: IEngineeringDecision): IModuleMetadata[] {
    const modules: IModuleMetadata[] = [];

    // All apps have a User Management module
    modules.push({
      name: 'UserManagement',
      purpose: 'Coordinates profile configurations, user logins, and registrations.',
      interfaces: ['IUserService', 'IUserRepository'],
      dependencies: ['Shared']
    });

    if (decision.profile.profileType === 'Healthcare') {
      modules.push(
        {
          name: 'AppointmentsScheduling',
          purpose: 'Coordinates consultant doctor availability calendars and patient admissions bookings.',
          interfaces: ['ISchedulingController', 'ISchedulingService'],
          dependencies: ['UserManagement', 'Shared']
        },
        {
          name: 'BillingLedger',
          purpose: 'Coordinates patient ledger billing invoice creation and claim transactions.',
          interfaces: ['IBillingService', 'IInvoiceRepository'],
          dependencies: ['UserManagement', 'Shared']
        }
      );
    } else if (decision.database.primary) {
      modules.push({
        name: 'DatabaseAccess',
        purpose: 'Coordinates core migration configurations, pooling drivers and CRUD models.',
        interfaces: ['IDbConnection', 'IMigrationRunner'],
        dependencies: ['Shared']
      });
    }

    return modules;
  }
}

export const moduleDesigner = new ModuleDesigner();
export default moduleDesigner;
