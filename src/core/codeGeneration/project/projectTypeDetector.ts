import { ProjectRequirements } from './projectTypes';

export class ProjectTypeDetector {
  private allowedTypes = [
    'Portfolio',
    'Landing Page',
    'Dashboard',
    'CRM',
    'ERP',
    'LMS',
    'Hospital Management',
    'Student Management',
    'Ecommerce',
    'SaaS',
    'Chat Application',
    'AI Application',
    'Browser Extension',
    'Desktop Application',
    'Mobile Application',
    'CLI Tool',
    'API Service'
  ];

  public detect(requirements: ProjectRequirements): string {
    const pt = requirements.projectType;
    if (this.allowedTypes.includes(pt)) {
      return pt;
    }

    const promptLower = requirements.prompt.toLowerCase();
    if (promptLower.includes('portfolio') || promptLower.includes('resume')) return 'Portfolio';
    if (promptLower.includes('landing') || promptLower.includes('promo')) return 'Landing Page';
    if (promptLower.includes('dashboard') || promptLower.includes('analytics')) return 'Dashboard';
    if (promptLower.includes('crm') || promptLower.includes('sales')) return 'CRM';
    if (promptLower.includes('erp') || promptLower.includes('inventory')) return 'ERP';
    if (promptLower.includes('lms') || promptLower.includes('learning') || promptLower.includes('course')) return 'LMS';
    if (promptLower.includes('hospital') || promptLower.includes('patient') || promptLower.includes('clinic')) return 'Hospital Management';
    if (promptLower.includes('student') || promptLower.includes('school') || promptLower.includes('class')) return 'Student Management';
    if (promptLower.includes('ecommerce') || promptLower.includes('store') || promptLower.includes('shop')) return 'Ecommerce';
    if (promptLower.includes('chat') || promptLower.includes('messaging') || promptLower.includes('whatsapp')) return 'Chat Application';
    if (promptLower.includes('ai ') || promptLower.includes('llm') || promptLower.includes('openai') || promptLower.includes('gemini')) return 'AI Application';
    if (promptLower.includes('extension') || promptLower.includes('chrome')) return 'Browser Extension';
    if (promptLower.includes('desktop') || promptLower.includes('electron')) return 'Desktop Application';
    if (promptLower.includes('mobile') || promptLower.includes('react native') || promptLower.includes('flutter')) return 'Mobile Application';
    if (promptLower.includes('cli') || promptLower.includes('command line')) return 'CLI Tool';
    if (promptLower.includes('api service') || promptLower.includes('backend api') || promptLower.includes('rest api')) return 'API Service';

    return 'SaaS'; // default fallback
  }
}

export const projectTypeDetector = new ProjectTypeDetector();
