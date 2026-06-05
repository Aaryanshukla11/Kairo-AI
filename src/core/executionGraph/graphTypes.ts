import { ExecutionNode } from './node';
import { ExecutionEdge } from './edge';

export enum GraphStatus {
  Pending = 'Pending',
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed'
}

export interface ExecutionGraph {
  id: string;
  planId: string;
  nodes: ExecutionNode[];
  edges: ExecutionEdge[];
  status: GraphStatus;
  createdAt: number;
}
