import { ExtractedFields, ClarificationQuestion, ConfidenceScores } from './types';

export class ClarificationEngine {
  public getQuestions(fields: ExtractedFields, scores: ConfidenceScores): {
    unresolved: string[];
    questions: ClarificationQuestion[];
  } {
    const unresolved: string[] = [];
    const questions: ClarificationQuestion[] = [];

    // 1. Check Project Type
    if (!fields.projectType || scores.projectType < 50) {
      unresolved.push('projectType');
      questions.push({
        field: 'projectType',
        question: 'Which type of application are you looking to generate?',
        priority: 'CRITICAL',
        options: ['SaaS', 'Ecommerce', 'Dashboard', 'CRM', 'API Service', 'Hospital Management']
      });
    }

    // 2. Check Frontend
    if (!fields.frontendPreference || scores.frontendPreference < 50) {
      unresolved.push('frontendPreference');
      questions.push({
        field: 'frontendPreference',
        question: 'Which frontend framework would you prefer to use?',
        priority: 'HIGH',
        options: ['React', 'Next.js', 'Vue', 'Svelte', 'Angular']
      });
    }

    // 3. Check Backend
    if (!fields.backendPreference || scores.backendPreference < 50) {
      unresolved.push('backendPreference');
      questions.push({
        field: 'backendPreference',
        question: 'Which backend framework should be used to build your APIs?',
        priority: 'HIGH',
        options: ['Express', 'FastAPI', 'NestJS', 'Django', 'Spring Boot']
      });
    }

    // 4. Check Database
    if (!fields.databasePreference || scores.databasePreference < 50) {
      unresolved.push('databasePreference');
      questions.push({
        field: 'databasePreference',
        question: 'Which database system would you prefer to hook up?',
        priority: 'MEDIUM',
        options: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite']
      });
    }

    // 5. Check Authentication
    if (!fields.authentication || scores.authentication < 50) {
      unresolved.push('authentication');
      questions.push({
        field: 'authentication',
        question: 'What authentication mechanism should be configured?',
        priority: 'MEDIUM',
        options: ['JWT', 'OAuth', 'Clerk', 'Auth.js']
      });
    }

    // 6. Check Deployment
    if (!fields.deploymentPreference || scores.deploymentPreference < 50) {
      unresolved.push('deploymentPreference');
      questions.push({
        field: 'deploymentPreference',
        question: 'Where do you plan to deploy the application container?',
        priority: 'LOW',
        options: ['Docker', 'Vercel', 'Netlify', 'AWS']
      });
    }

    // Sort questions by priority order: CRITICAL -> HIGH -> MEDIUM -> LOW
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    questions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return {
      unresolved,
      questions
    };
  }
}

export const clarificationEngine = new ClarificationEngine();
export default clarificationEngine;
