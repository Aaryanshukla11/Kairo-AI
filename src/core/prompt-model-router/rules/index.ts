import { ModelType } from '../types';

export class RoutingRules {
  public resolveModelType(intent: string): ModelType {
    switch (intent.toUpperCase()) {
      case 'NEW_PROJECT':
      case 'MODIFY_PROJECT':
        return 'Planning Model';
      case 'DEBUG_PROJECT':
      case 'EXPLAIN_CODE':
      case 'CHAT':
      case 'UNKNOWN':
        return 'Coding Model';
      case 'SEARCH_DOCUMENTATION':
      case 'KNOWLEDGE_RETRIEVAL':
        return 'Embedding Model';
      case 'IMAGE_OR_FIGMA':
        return 'Vision Model';
      default:
        // Default fallback selection is Coding Model
        return 'Coding Model';
    }
  }
}

export const routingRules = new RoutingRules();
export default routingRules;
