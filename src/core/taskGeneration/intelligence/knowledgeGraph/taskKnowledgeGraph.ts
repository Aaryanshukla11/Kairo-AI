import { TaskKnowledgeMetadata } from './knowledgeGraphTypes';
import { TaskModel } from '../../taskTypes';

export class TaskKnowledgeGraph {
  public buildMetadataMap(tasks: TaskModel[]): Record<string, TaskKnowledgeMetadata> {
    const map: Record<string, TaskKnowledgeMetadata> = {};

    for (const task of tasks) {
      const isUI = task.taskType === 'UI Task';
      const isDB = task.taskType === 'Database Task';
      const isAPI = task.taskType === 'API Task';

      map[task.taskId] = {
        taskId: task.taskId,
        requiredFiles: [...task.requiredFiles],
        producedFiles: task.requiredFiles.map(f => `out/${f}`),
        requiredSymbols: [...task.requiredSymbols],
        producedSymbols: task.requiredSymbols.map(s => `Generated_${s}`),
        apis: isAPI ? [`/api/v1/${task.taskId.toLowerCase()}`] : [],
        services: isAPI || task.taskType === 'Backend Task' ? [`Service_${task.taskId}`] : [],
        components: isUI ? [`Component_${task.taskId}`] : [],
        databaseTables: isDB ? [`table_${task.taskId.toLowerCase()}`] : [],
        dependencies: [...task.dependencies],
        risk: task.risk,
        confidence: task.confidence
      };
    }

    return map;
  }
}
export const taskKnowledgeGraph = new TaskKnowledgeGraph();
