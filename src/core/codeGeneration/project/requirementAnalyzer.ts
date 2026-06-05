import { ProjectRequirements } from './projectTypes';

export class RequirementAnalyzer {
  public analyze(prompt: string): ProjectRequirements {
    const logs: string[] = [];
    logs.push(`[RequirementAnalyzer] Starting analysis for prompt: "${prompt}"`);

    // Extract explicit domain/features from prompt keywords
    const lowerPrompt = prompt.toLowerCase();
    let projectType = 'SaaS';
    let domain = 'General Software';
    const features: string[] = ['User Authentication', 'Standard Dashboard Layout', 'Responsive Navigation UI'];
    const functionalRequirements: string[] = ['Allow users to login and register', 'Access visual data components', 'Save configuration details'];
    const nonFunctionalRequirements: string[] = ['Response times under 200ms', 'Fully isolated database storage', 'Scale-ready containerization'];
    const uiRequirements: string[] = ['Responsive layouts (Desktop/Mobile)', 'Integrated Dark Mode toggle option'];
    let authenticationRequirements = 'JWT Authentication';
    let databaseRequirements = 'PostgreSQL';
    let deploymentRequirements = 'Docker containerization';
    const userPreferences: Record<string, any> = {};

    // Custom matching for Hospital Management System
    if (lowerPrompt.includes('hospital') || lowerPrompt.includes('clinic') || lowerPrompt.includes('medical')) {
      projectType = 'Hospital Management';
      domain = 'Healthcare';
      features.push('Patient Registration & Intake', 'Appointment Scheduling calendar', 'Billing & Invoicing generator', 'Doctor Directory');
      functionalRequirements.push('Doctors can update patient medical logs', 'Patients can book consulting appointments', 'Generate PDF bills');
      nonFunctionalRequirements.push('HIPAA and health data privacy compliance', 'Audit trail for client record access');
      uiRequirements.push('Calendar schedulers UI', 'Billing tables with pagination');
    } else if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shop') || lowerPrompt.includes('store')) {
      projectType = 'Ecommerce';
      domain = 'Retail / Digital Sales';
      features.push('Product Catalog display', 'Shopping Cart checkout', 'Stripe checkout integration', 'Orders Management');
      functionalRequirements.push('Users can add items to carts', 'Process credit card checkout transactions');
      databaseRequirements = 'PostgreSQL';
    } else if (lowerPrompt.includes('crm') || lowerPrompt.includes('customer')) {
      projectType = 'CRM';
      domain = 'Sales Support';
      features.push('Contact Directories', 'Sales Pipeline Kanban boards', 'Interactions History loggers');
    } else if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('analytics')) {
      projectType = 'Dashboard';
      domain = 'Business Intelligence';
      features.push('Real-time widgets tracking', 'CSV reports downloads', 'Metrics charts grids');
    }

    // Detect database preference
    if (lowerPrompt.includes('mysql')) {
      databaseRequirements = 'MySQL';
    } else if (lowerPrompt.includes('mongodb')) {
      databaseRequirements = 'MongoDB';
    } else if (lowerPrompt.includes('sqlite')) {
      databaseRequirements = 'SQLite';
    }

    // Detect auth preference
    if (lowerPrompt.includes('clerk')) {
      authenticationRequirements = 'Clerk Authentication';
    } else if (lowerPrompt.includes('oauth')) {
      authenticationRequirements = 'OAuth 2.0 Auth';
    } else if (lowerPrompt.includes('auth.js') || lowerPrompt.includes('nextauth')) {
      authenticationRequirements = 'Auth.js Identity';
    }

    // Detect deployment preference
    if (lowerPrompt.includes('vercel')) {
      deploymentRequirements = 'Vercel Deployment';
    } else if (lowerPrompt.includes('aws')) {
      deploymentRequirements = 'AWS Elastic Container Service';
    } else if (lowerPrompt.includes('netlify')) {
      deploymentRequirements = 'Netlify Hosting';
    }

    return {
      prompt,
      projectType,
      domain,
      features,
      functionalRequirements,
      nonFunctionalRequirements,
      uiRequirements,
      authenticationRequirements,
      databaseRequirements,
      deploymentRequirements,
      userPreferences
    };
  }
}

export const requirementAnalyzer = new RequirementAnalyzer();
