import { ProjectArchitecture, TechnologyStack } from './projectTypes';

export class ArchitectureGenerator {
  public generate(stack: TechnologyStack, projectType: string): ProjectArchitecture {
    const routing = ['/auth/login', '/auth/register', '/dashboard', '/settings'];
    const services = ['AuthService', 'UserService', 'ApiService', 'NotificationService'];
    const components = ['Navbar', 'Sidebar', 'Header', 'Footer', 'Button', 'Table', 'FormInput', 'Card'];
    let stateManagement = 'React Context API';
    let apiStructure = 'RESTful API with JSON controller-routing';

    if (projectType === 'Hospital Management') {
      routing.push('/patients', '/appointments', '/billing', '/doctors');
      services.push('PatientService', 'AppointmentService', 'BillingService', 'DoctorService');
      components.push('CalendarView', 'PatientForm', 'AppointmentModal', 'InvoiceTable');
    } else if (projectType === 'Ecommerce') {
      routing.push('/products', '/cart', '/checkout', '/orders');
      services.push('ProductService', 'CartService', 'OrderService', 'PaymentService');
      components.push('ProductCard', 'CartList', 'CheckoutForm', 'OrderSummary');
    }

    if (stack.frontend === 'Next.js') {
      stateManagement = 'Zustand / Next.js Server Actions';
    } else if (stack.frontend === 'Vue') {
      stateManagement = 'Pinia';
    } else if (stack.frontend === 'Svelte') {
      stateManagement = 'Svelte Writable Stores';
    } else if (stack.frontend === 'Angular') {
      stateManagement = 'NgRx';
    }

    if (stack.backend === 'FastAPI') {
      apiStructure = 'FastAPI APIRouter controllers with Pydantic body validation';
    } else if (stack.backend === 'NestJS') {
      apiStructure = 'NestJS module controllers with DTO class-validator decorators';
    }

    // Build the folder structure nodes representation tree
    const folderStructure = {
      name: 'root',
      type: 'dir' as 'dir',
      children: [
        {
          name: 'frontend',
          type: 'dir' as 'dir',
          children: [
            { name: 'src', type: 'dir' as 'dir', children: [
              { name: 'components', type: 'dir' as 'dir' },
              { name: 'pages', type: 'dir' as 'dir' },
              { name: 'services', type: 'dir' as 'dir' },
              { name: 'styles', type: 'dir' as 'dir' }
            ]}
          ]
        },
        {
          name: 'backend',
          type: 'dir' as 'dir',
          children: [
            { name: 'app', type: 'dir' as 'dir', children: [
              { name: 'api', type: 'dir' as 'dir' },
              { name: 'core', type: 'dir' as 'dir' },
              { name: 'models', type: 'dir' as 'dir' },
              { name: 'schemas', type: 'dir' as 'dir' },
              { name: 'services', type: 'dir' as 'dir' }
            ]}
          ]
        },
        {
          name: 'database',
          type: 'dir' as 'dir',
          children: [
            { name: 'migrations', type: 'dir' as 'dir' },
            { name: 'seeders', type: 'dir' as 'dir' }
          ]
        }
      ]
    };

    return {
      folderStructure,
      routing,
      services,
      components,
      stateManagement,
      apiStructure
    };
  }
}

export const architectureGenerator = new ArchitectureGenerator();
