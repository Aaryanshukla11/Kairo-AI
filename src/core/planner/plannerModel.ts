import { localInferenceService } from '../inference';
import { IModelConfig } from '../inference/types';

export interface IPlanProposalTask {
  id: string;
  title: string;
  description?: string;
  targetFiles: string[];
  requiredCapability: string;
  dependencies?: string[];
  operation?: 'CREATE_FILE' | 'MODIFY_FILE' | 'DELETE_FILE';
  rationale?: string;
}

export interface IPlanProposal {
  tasks: IPlanProposalTask[];
}

export interface IPlannerModel {
  generatePlanProposal(
    prompt: string,
    context?: { workspacePath?: string; conversationHistory?: any[] }
  ): Promise<IPlanProposal>;
}

export function validatePlanProposal(proposal: any): IPlanProposal {
  if (!proposal || typeof proposal !== 'object') {
    throw new Error('Plan proposal must be a valid JSON object.');
  }

  if (!Array.isArray(proposal.tasks) || proposal.tasks.length === 0) {
    throw new Error('Plan proposal must contain a non-empty "tasks" array.');
  }

  if (proposal.tasks.length > 10) {
    throw new Error('Plan proposal exceeds maximum task limit of 10.');
  }

  const validTaskIds = new Set<string>();
  const allTargetFiles = new Set<string>();

  for (const task of proposal.tasks) {
    if (!task.id || typeof task.id !== 'string') {
      throw new Error('Task missing valid "id".');
    }
    if (validTaskIds.has(task.id)) {
      throw new Error(`Duplicate task ID found: "${task.id}".`);
    }
    validTaskIds.add(task.id);

    if (!task.title || typeof task.title !== 'string') {
      throw new Error(`Task "${task.id}" missing valid "title".`);
    }

    if (!Array.isArray(task.targetFiles) || task.targetFiles.length === 0) {
      throw new Error(`Task "${task.id}" must contain a non-empty "targetFiles" array.`);
    }

    for (const filePath of task.targetFiles) {
      if (typeof filePath !== 'string' || filePath.trim() === '') {
        throw new Error(`Task "${task.id}" contains empty or invalid target file path.`);
      }

      // Security validations: reject path escaping, drive letters, absolute paths, URLs
      if (filePath.includes('../') || filePath.startsWith('/') || /^[a-zA-Z]:[\\\/]/.test(filePath) || /^https?:\/\//i.test(filePath)) {
        throw new Error(`Task "${task.id}" contains unauthorized or unsafe file path: "${filePath}". Target files must be workspace-relative.`);
      }
      allTargetFiles.add(filePath);
    }

    if (!task.requiredCapability || typeof task.requiredCapability !== 'string') {
      throw new Error(`Task "${task.id}" missing valid "requiredCapability".`);
    }

    if (task.operation && !['CREATE_FILE', 'MODIFY_FILE', 'DELETE_FILE'].includes(task.operation)) {
      throw new Error(`Task "${task.id}" contains invalid operation type: "${task.operation}".`);
    }
  }

  // Validate dependencies
  for (const task of proposal.tasks) {
    if (Array.isArray(task.dependencies)) {
      const resolvedDeps: string[] = [];
      for (const depId of task.dependencies) {
        if (validTaskIds.has(depId)) {
          resolvedDeps.push(depId);
        } else {
          // If LLM mistakenly referenced a target filename (e.g. "index.html"), resolve it to its matching task ID
          const matchingTask = proposal.tasks.find((t: any) => t.id !== task.id && t.targetFiles && t.targetFiles.includes(depId));
          if (matchingTask) {
            resolvedDeps.push(matchingTask.id);
          } else {
            throw new Error(`Task "${task.id}" references invalid dependency ID: "${depId}".`);
          }
        }
      }
      task.dependencies = Array.from(new Set(resolvedDeps));
    }
  }

  return proposal as IPlanProposal;
}

export class DefaultPlannerModel implements IPlannerModel {
  public async generatePlanProposal(
    prompt: string,
    context?: { workspacePath?: string; conversationHistory?: any[] }
  ): Promise<IPlanProposal> {
    const plannerPrompt = `You are Kairo-AI's expert software architecture planner. Analyze the user prompt and return a minimal, complete execution plan as a valid JSON object.
Return ONLY JSON with this schema:
{
  "tasks": [
    {
      "id": "task-1",
      "title": "Short descriptive title",
      "description": "Task summary",
      "operation": "CREATE_FILE",
      "targetFiles": ["relative/path/to/file.ext"],
      "requiredCapability": "backend|html|css|config|documentation|utilities",
      "dependencies": [],
      "rationale": "Short explanation"
    }
  ]
}

CRITICAL DEPENDENCY RULE:
The "dependencies" array MUST contain ONLY previous task IDs (e.g. ["task-1"]). DO NOT use filenames like ["index.html"] in dependencies.

Valid capabilities: "html", "css", "config", "documentation", "backend", "utilities".
User Request: ${prompt}`;

    const defaultConfig: IModelConfig = {
      provider: 'gemini',
      modelName: 'gemini-2.5-flash',
      modelPath: '',
      contextLength: 16384,
      temperature: 0.1,
      topP: 0.9,
      topK: 40,
      maxTokens: 2048,
      gpuLayers: 0,
      threadCount: 4,
      streamingEnabled: false
    };

    try {
      const result = await localInferenceService.execute(plannerPrompt, defaultConfig);
      if (result.errors && result.errors.length > 0) {
        throw new Error(`Inference Error: ${result.errors.join(', ')}`);
      }
      const rawJson = result.generatedText || '';
      const cleanJson = rawJson.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return validatePlanProposal(parsed);
    } catch (err: any) {
      throw new Error(`PlannerModel execution failed: ${err.message || String(err)}`);
    }
  }
}

export const defaultPlannerModel = new DefaultPlannerModel();
