export type IntentCategory = 'CHAT' | 'EXPLAIN' | 'DEBUG' | 'SAFE_ACTION' | 'HIGH_RISK_ACTION';

export interface ParsedIntent {
  title: string;
  summary: string;
  category: IntentCategory;
  requiresFiles: boolean;
  requiresApproval: boolean;
}

export function parsePromptIntoIntent(prompt: string): ParsedIntent {
  const normalized = prompt.trim().toLowerCase();

  // 1. CHAT / CONVERSATION
  if (/^(hello|hi|hey|greetings|good\s+(morning|afternoon|evening)|who\s+are\s+you|what\s+can\s+you\s+do|thanks|thank\s+you)\b/i.test(normalized) || normalized.length <= 4) {
    return {
      title: "Conversational Chat",
      summary: "Direct assistant response",
      category: 'CHAT',
      requiresFiles: false,
      requiresApproval: false
    };
  }

  // 2. READ-ONLY EXPLANATION & QUESTION
  if (/^(what|why|how|where|which|who|explain|tell\s+me|understand|inspect)\b/i.test(normalized) && !/\b(create|build|write|generate|delete|remove|fix|modify)\b/i.test(normalized)) {
    return {
      title: "Project Analysis & Explanation",
      summary: "Analyze project context and answer user query",
      category: 'EXPLAIN',
      requiresFiles: false,
      requiresApproval: false
    };
  }

  // 3. DEBUG & DIAGNOSIS
  if (/\b(debug|diagnose|error|failing|bug|issue|problem|broken|stacktrace|exception)\b/i.test(normalized) && !/\b(delete|wipe|purge|remove)\b/i.test(normalized)) {
    return {
      title: "Debug & Diagnostics",
      summary: "Inspect workspace errors and explain diagnosis",
      category: 'DEBUG',
      requiresFiles: false,
      requiresApproval: false
    };
  }

  // 4. DESTRUCTIVE / HIGH-RISK ACTIONS (Approval Mandatory)
  if (/\b(delete\s+all|wipe|purge|remove\s+all|overwrite\s+everything|destroy)\b/i.test(normalized)) {
    return {
      title: "High-Risk Workspace Action",
      summary: "Destructive file or directory operation requiring explicit review.",
      category: 'HIGH_RISK_ACTION',
      requiresFiles: true,
      requiresApproval: true
    };
  }

  // 5. STANDARD SAFE ACTION (File Creation, Code Edits, Component Scaffolding)
  const cleaned = prompt.replace(/^(create|build|generate|make|add|fix)\s+/i, '');
  const capitalized = cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : 'Requested Component';

  return {
    title: `Create ${capitalized}`,
    summary: `Generate and update workspace files for "${prompt}".`,
    category: 'SAFE_ACTION',
    requiresFiles: true,
    requiresApproval: false // Auto-execute safe creation/modifications!
  };
}
