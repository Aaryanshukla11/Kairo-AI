import { ExecutionPlan, RiskLevel, Task, TaskStatus } from './types';

export class PlanBuilder {
  private plan: Partial<ExecutionPlan>;

  constructor(id: string) {
    this.plan = {
      id,
      tasks: [],
      estimatedSteps: 0,
      estimatedFiles: 0,
      riskLevel: RiskLevel.Low
    };
  }

  setTitle(title: string): PlanBuilder {
    this.plan.title = title;
    return this;
  }

  setSummary(summary: string): PlanBuilder {
    this.plan.summary = summary;
    return this;
  }

  setRiskLevel(level: RiskLevel): PlanBuilder {
    this.plan.riskLevel = level;
    return this;
  }

  addTask(task: Omit<Task, 'id' | 'status'> & { id?: string, status?: TaskStatus }): PlanBuilder {
    const newTask: Task = {
      id: task.id || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: task.status || TaskStatus.Pending,
      title: task.title,
      description: task.description,
      dependencies: task.dependencies || [],
      estimatedTime: task.estimatedTime || '1m'
    };
    
    this.plan.tasks!.push(newTask);
    this.plan.estimatedSteps = this.plan.tasks!.length;
    return this;
  }
  
  setEstimatedFiles(count: number): PlanBuilder {
    this.plan.estimatedFiles = count;
    return this;
  }

  build(): ExecutionPlan {
    if (!this.plan.title) {
      throw new Error("Plan title is required");
    }
    
    return this.plan as ExecutionPlan;
  }
}
