import { ExecutionPlan } from './types';

export function validatePrompt(prompt: string): boolean {
  if (!prompt || typeof prompt !== 'string') return false;
  if (prompt.trim().length === 0) return false;
  return true;
}

export function validatePlan(plan: ExecutionPlan): boolean {
  if (!plan || !plan.id || !plan.title) return false;
  if (!plan.tasks || !Array.isArray(plan.tasks) || plan.tasks.length === 0) return false;
  
  // Validate that all tasks have basic fields
  for (const task of plan.tasks) {
    if (!task.id || !task.title || !task.status) return false;
  }
  
  return true;
}
