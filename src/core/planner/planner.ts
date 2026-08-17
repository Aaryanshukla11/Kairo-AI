import { ExecutionPlan, RiskLevel } from './types';
import { validatePrompt, validatePlan } from './validator';
import { parsePromptIntoIntent } from './parser';
import { PlanBuilder } from './planBuilder';
import { logKairoStage } from '../../common/kairoLogger';
import { IPlannerModel, IPlanProposal, validatePlanProposal } from './plannerModel';

export interface IPlannerOptions {
  workspacePath?: string;
  conversationHistory?: any[];
  plannerModel?: IPlannerModel;
  proposal?: IPlanProposal;
}

export class ExecutionPlanner {
  
  /**
   * Main entrypoint for generating an ExecutionPlan from a prompt using Hybrid Routing.
   * - Fast-Path (Deterministic): Explicit filenames in prompt -> instant regex plan (0 model calls).
   * - Smart-Path (LLM Proposal): Unspecified requests -> structured proposal validation. Fails honestly if proposal invalid.
   */
  public generatePlan(prompt: string, options?: IPlannerOptions): ExecutionPlan {
    const executionId = `plan-${Date.now()}`;
    const startTime = Date.now();
    logKairoStage('Planner', 'ENTER', executionId, { prompt });

    try {
      if (!validatePrompt(prompt)) {
        throw new Error('Invalid prompt: Prompt cannot be empty.');
      }

      const intent = parsePromptIntoIntent(prompt);
      const planId = `plan-${Date.now()}`;

      // Generic file path extraction strategy: Extract explicit files (e.g. index.html, src/utils.ts, README.md)
      const filePattern = /\b([a-zA-Z0-9_\-\/]+\.[a-zA-Z0-9]{1,10})\b/gi;
      const matches = prompt.match(filePattern) || [];
      
      // Filter out URLs or common non-file extensions
      const cleanFiles = Array.from(new Set(
        matches.filter(f => !/\.(com|org|net|io|ai|gov|edu|dev)$/i.test(f))
      ));

      let resolvedFiles: string[] = [];
      let tasksToBuild: { id?: string; title: string; targetFiles: string[]; requiredCapability: string; operation?: string; dependencies?: string[] }[] = [];

      if (cleanFiles.length > 0) {
        // FAST-PATH: Deterministic plan for explicit filenames
        resolvedFiles = cleanFiles;
        tasksToBuild = cleanFiles.map((file) => {
          const ext = file.substring(file.lastIndexOf('.')).toLowerCase();
          
          let requiredCapability = 'ui_components';
          if (['.md', '.txt', '.doc'].includes(ext)) {
            requiredCapability = 'documentation';
          } else if (ext === '.html') {
            requiredCapability = 'html';
          } else if (ext === '.css') {
            requiredCapability = 'css';
          } else if (['.json', '.env', '.yaml', '.yml'].includes(ext)) {
            requiredCapability = 'config';
          } else if (['.ts', '.js', '.py', '.go', '.java'].includes(ext)) {
            requiredCapability = file.includes('service') || file.includes('api') || file.includes('controller') ? 'backend' : 'utilities';
          }

          return {
            title: `Synthesize ${file}`,
            targetFiles: [file],
            requiredCapability,
            operation: 'CREATE_FILE'
          };
        });
      } else {
        // SMART-PATH: LLM Proposal validation path for unspecified multi-file requests
        let proposal: IPlanProposal | null = null;

        if (options?.proposal) {
          proposal = validatePlanProposal(options.proposal);
        } else {
          // If proposal is not provided, check if context exists or fail honestly (no static fallbacks)
          throw new Error(`Planning Failed: Unspecified request "${prompt}" requires a valid LLM plan proposal. Static fallback paths are disabled.`);
        }

        const proposalFiles: string[] = [];
        tasksToBuild = proposal.tasks.map((t) => {
          t.targetFiles.forEach(f => proposalFiles.push(f));
          return {
            id: t.id,
            title: t.title,
            targetFiles: t.targetFiles,
            requiredCapability: t.requiredCapability,
            operation: t.operation || 'CREATE_FILE',
            dependencies: t.dependencies
          };
        });
        resolvedFiles = Array.from(new Set(proposalFiles));
      }

      const builder = new PlanBuilder(planId)
        .setTitle(intent.title)
        .setSummary(intent.summary)
        .setRiskLevel(intent.requiresFiles ? RiskLevel.Medium : RiskLevel.Low)
        .setTargetFiles(resolvedFiles);

      tasksToBuild.forEach((t, idx) => {
        builder.addTask({
          id: t.id || `task-${planId}-${idx + 1}`,
          title: t.title,
          description: `Generate ${t.targetFiles.join(', ')} artifact.`,
          dependencies: t.dependencies || (idx > 0 ? [`task-${planId}-${idx}`] : []),
          targetFiles: t.targetFiles,
          requiredCapability: t.requiredCapability,
          estimatedTime: '1m'
        });
      });

      const plan = builder.build();

      if (!validatePlan(plan)) {
        throw new Error('Failed to build a valid Execution Plan.');
      }

      const duration = Date.now() - startTime;
      logKairoStage('Planner', 'EXIT', executionId, { prompt }, { planId: plan.id }, duration);
      return plan;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logKairoStage('Planner', 'ERROR', executionId, { prompt }, null, duration, error);
      throw error;
    }
  }
}

// Singleton instance export
export const plannerEngine = new ExecutionPlanner();
