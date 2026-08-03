import { ModelCapability } from '../modelRegistry/registryTypes';

export enum RouterTaskType {
  Chat = 'Chat',
  CodeCompletion = 'CodeCompletion',
  CodeGeneration = 'CodeGeneration',
  Review = 'Review',
  Debugging = 'Debugging',
  Testing = 'Testing',
  Planning = 'Planning',
  Architecture = 'Architecture',
  Documentation = 'Documentation',
  Embedding = 'Embedding',
  Vision = 'Vision'
}

export enum FallbackStrategy {
  NextBestModel = 'Next Best Model',
  SameFamily = 'Same Family',
  LowerParameterModel = 'Lower Parameter Model',
  CpuFallback = 'CPU Fallback',
  EmergencyFallback = 'Emergency Fallback',
  ManualSelection = 'Manual Selection'
}

export interface RoutingRequest {
  requestId: string;
  taskType: RouterTaskType;
  requiredCapabilities: ModelCapability[];
  priority: 'low' | 'normal' | 'high';
  temperature?: number;
  topP?: number;
}

export interface RoutingDecisionModel {
  decisionId: string;
  timestamp: number;
  selectedModelId: string;
  alternatives: string[];
  confidence: number; // 0.0 - 1.0
  performanceEstimateTps: number;
  factors: {
    capabilityMatchScore: number;
    resourceScore: number;
    performanceScore: number;
  };
}

export enum RoutingEventType {
  RequestReceived = 'RequestReceived',
  CandidatesCollected = 'CandidatesCollected',
  CapabilitiesMatched = 'CapabilitiesMatched',
  PerformanceScored = 'PerformanceScored',
  ResourceValidated = 'ResourceValidated',
  DecisionMade = 'DecisionMade',
  FallbackTriggered = 'FallbackTriggered'
}

export interface RoutingEvent {
  type: RoutingEventType;
  timestamp: number;
  payload?: any;
}

export type RoutingEventListener = (event: RoutingEvent) => void;
