export interface ParsedIntent {
  title: string;
  summary: string;
  requiresFiles: boolean;
}

export function parsePromptIntoIntent(prompt: string): ParsedIntent {
  // Simple deterministic mock parser for foundation testing
  const normalized = prompt.toLowerCase();
  
  let title = "Execute General Task";
  let summary = `Execution plan for: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`;
  let requiresFiles = false;

  if (normalized.includes('login') || normalized.includes('auth')) {
    title = "Implement Authentication/Login";
    summary = "Generate responsive login components and setup authentication routes.";
    requiresFiles = true;
  } else if (normalized.includes('ui') || normalized.includes('component')) {
    title = "Build UI Components";
    summary = "Scaffold and style the requested user interface components.";
    requiresFiles = true;
  } else if (normalized.includes('api') || normalized.includes('backend')) {
    title = "Implement Backend API";
    summary = "Create API routes and necessary data validation logic.";
    requiresFiles = true;
  }

  return {
    title,
    summary,
    requiresFiles
  };
}
