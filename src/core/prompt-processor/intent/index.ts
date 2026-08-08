import { PromptIntent } from '../types';

interface IIntentRule {
  intent: PromptIntent;
  keywords: string[];
}

export class IntentDetector {
  private rules: IIntentRule[] = [
    {
      intent: 'NEW_PROJECT',
      keywords: ['create', 'build', 'generate project', 'scaffold', 'new project', 'setup project', 'make an app', 'new app', 'bootstrap', 'start a project']
    },
    {
      intent: 'MODIFY_PROJECT',
      keywords: [
        'modify', 'add feature', 'update', 'change', 'extend', 'insert', 'alter', 'append', 'implement a new feature',
        'refactor', 'clean', 'optimize', 'improve structure', 'restructure', 'simplify', 'reorganize',
        'test', 'unit test', 'spec', 'integration test', 'jest', 'pytest', 'mocha', 'assert', 'code coverage',
        'document', 'readme', 'docs', 'docstring', 'comments', 'explain functions', 'wiki', 'generate documentation',
        'deploy', 'dockerize', 'kubernetes', 'k8s', 'aws', 'cloud', 'vercel', 'heroku', 'publish', 'hosting'
      ]
    },
    {
      intent: 'DEBUG_PROJECT',
      keywords: ['fix', 'bug', 'error', 'debug', 'crash', 'fails', 'broken', 'issue', 'resolve exception', 'unhandled rejection']
    },
    {
      intent: 'EXPLAIN_CODE',
      keywords: ['explain', 'how does', 'what does', 'describe', 'understand', 'walk through', 'clarify code']
    },
    {
      intent: 'CHAT',
      keywords: ['hello', 'hi', 'hey', 'greetings', 'howdy', 'chat', 'who are you', 'how are you']
    }
  ];

  public detect(prompt: string): { intent: PromptIntent; confidence: number } {
    if (!prompt) {
      return { intent: 'UNKNOWN', confidence: 0 };
    }

    const cleanPrompt = prompt.toLowerCase();
    let bestIntent: PromptIntent = 'UNKNOWN';
    let highestScore = 0;

    for (const rule of this.rules) {
      let matchCount = 0;
      for (const keyword of rule.keywords) {
        if (cleanPrompt.includes(keyword)) {
          matchCount++;
        }
      }
      
      if (matchCount > 0) {
        // Calculate a score based on match count, normalized
        const score = Math.min(matchCount / 2 + 0.5, 1.0);
        if (score > highestScore) {
          highestScore = score;
          bestIntent = rule.intent;
        }
      }
    }

    if (bestIntent === 'UNKNOWN') {
      return { intent: 'UNKNOWN', confidence: 0.1 };
    }

    return { intent: bestIntent, confidence: parseFloat(highestScore.toFixed(2)) };
  }
}

export const intentDetector = new IntentDetector();
export default intentDetector;
