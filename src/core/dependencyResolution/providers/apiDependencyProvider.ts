import { DependencyNode, DependencyEdge, DependencyResolutionInput } from '../dependencyTypes';

export class ApiDependencyProvider {
  public collect(input: DependencyResolutionInput): { nodes: DependencyNode[]; edges: DependencyEdge[] } {
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];

    // Extract API routes or mock defaults
    const apis = ['GET /api/session', 'POST /api/task', 'GET /api/history'];
    
    for (const api of apis) {
      nodes.push({
        id: `api:${api}`,
        name: api,
        type: 'API',
        metadata: { endpoint: api }
      });
    }

    // Connect task API to session API as an example
    edges.push({
      id: 'dep-api-task-session',
      source: 'api:POST /api/task',
      target: 'api:GET /api/session',
      type: 'API',
      direction: 'Outgoing',
      strength: 'Direct',
      required: true,
      optional: false,
      risk: 'Low',
      confidence: 0.95
    });

    return { nodes, edges };
  }
}

export const apiDependencyProvider = new ApiDependencyProvider();
