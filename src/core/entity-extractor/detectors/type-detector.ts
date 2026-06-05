import { IEntity } from '../types';

export class TypeDetector {
  private typeMappings: { type: string; keywords: string[] }[] = [
    { type: 'Portfolio', keywords: ['portfolio', 'personal website', 'resume site', 'my works'] },
    { type: 'Landing Page', keywords: ['landing page', 'product page', 'marketing site', 'coming soon'] },
    { type: 'Dashboard', keywords: ['dashboard', 'analytics panel', 'metrics page'] },
    { type: 'Admin Panel', keywords: ['admin panel', 'backoffice', 'administration portal'] },
    { type: 'CRM', keywords: ['crm', 'customer relationship', 'client manager'] },
    { type: 'ERP', keywords: ['erp', 'enterprise resource planning'] },
    { type: 'Hospital Management', keywords: ['hospital management', 'patient records', 'clinic manager', 'healthcare app'] },
    { type: 'Student Management', keywords: ['student management', 'school manager', 'student database'] },
    { type: 'Learning Management', keywords: ['learning management', 'lms', 'online courses', 'elearning'] },
    { type: 'Ecommerce', keywords: ['ecommerce', 'e-commerce', 'online store', 'shopping cart', 'web shop'] },
    { type: 'Marketplace', keywords: ['marketplace', 'multi-vendor store', 'ebay clone'] },
    { type: 'Food Delivery', keywords: ['food delivery', 'restaurant app', 'ubereats clone', 'meal delivery'] },
    { type: 'Social Media', keywords: ['social media', 'instagram clone', 'facebook clone', 'social network'] },
    { type: 'Chat Application', keywords: ['chat application', 'chat app', 'whatsapp clone', 'slack clone', 'messenger'] },
    { type: 'Video Streaming', keywords: ['video streaming', 'youtube clone', 'netflix clone', 'media player'] },
    { type: 'Banking', keywords: ['banking app', 'bank portal', 'online banking'] },
    { type: 'Finance', keywords: ['finance tracker', 'expense manager', 'budget planner', 'fintech'] },
    { type: 'Inventory', keywords: ['inventory manager', 'stock manager', 'warehouse system'] },
    { type: 'HRMS', keywords: ['hrms', 'hr management', 'payroll system', 'employee records'] },
    { type: 'Booking System', keywords: ['booking system', 'reservation manager', 'ticket reservation'] },
    { type: 'Blog', keywords: ['blog', 'news website', 'articles site'] },
    { type: 'CMS', keywords: ['cms', 'content management system', 'wordpress clone'] },
    { type: 'Browser Extension', keywords: ['browser extension', 'chrome extension', 'firefox addon'] },
    { type: 'Desktop Application', keywords: ['desktop application', 'electron app', 'desktop app'] },
    { type: 'CLI Tool', keywords: ['cli tool', 'command line interface', 'terminal utility'] },
    { type: 'REST API', keywords: ['rest api', 'backend service', 'api gateway'] },
    { type: 'Microservice', keywords: ['microservice', 'distributed service', 'grpc service'] }
  ];

  public detect(prompt: string): IEntity<string> {
    const clean = prompt.toLowerCase();
    
    for (const mapping of this.typeMappings) {
      for (const keyword of mapping.keywords) {
        if (clean.includes(keyword)) {
          return {
            value: mapping.type,
            confidence: 0.95
          };
        }
      }
    }

    return {
      value: 'UNKNOWN',
      confidence: 0.0
    };
  }
}

export const typeDetector = new TypeDetector();
export default typeDetector;
