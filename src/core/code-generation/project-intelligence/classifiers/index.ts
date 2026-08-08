import { IEnterpriseRequirement } from '../../requirement-schema';

export class ProjectClassifier {
  public classify(req: IEnterpriseRequirement): string {
    const type = req.identity.projectType.toLowerCase();
    const prompt = req.originalPrompt.toLowerCase();

    if (type.includes('hospital') || prompt.includes('clinic')) {
      return 'Hospital Management';
    }
    if (type.includes('netflix') || prompt.includes('streaming') || prompt.includes('youtube')) {
      return 'Streaming Platform';
    }
    if (type.includes('ecommerce') || prompt.includes('shop') || prompt.includes('store')) {
      return 'Ecommerce';
    }
    if (type.includes('crm') || prompt.includes('customer relationship')) {
      return 'CRM';
    }
    if (type.includes('chat') || prompt.includes('messaging') || prompt.includes('slack')) {
      return 'Chat Application';
    }
    if (type.includes('api') || type.includes('microservice')) {
      return 'API Service';
    }
    if (type.includes('dashboard') || prompt.includes('analytics')) {
      return 'Dashboard';
    }

    return 'Unknown';
  }
}

export const projectClassifier = new ProjectClassifier();
export default projectClassifier;
