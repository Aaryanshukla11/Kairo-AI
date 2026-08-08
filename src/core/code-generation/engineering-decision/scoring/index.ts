export interface ITechScores {
  name: string;
  performance: number;
  learningCurve: number;
  maintainability: number;
  security: number;
  overall: number;
}

export class TechnologyScoringEngine {
  private database: ITechScores[] = [
    { name: 'PostgreSQL', performance: 90, learningCurve: 80, maintainability: 95, security: 95, overall: 90 },
    { name: 'MongoDB', performance: 85, learningCurve: 90, maintainability: 80, security: 85, overall: 82 },
    { name: 'SQLite', performance: 75, learningCurve: 95, maintainability: 90, security: 70, overall: 82 }
  ];

  private frontend: ITechScores[] = [
    { name: 'React', performance: 88, learningCurve: 75, maintainability: 90, security: 90, overall: 86 },
    { name: 'Next.js', performance: 95, learningCurve: 70, maintainability: 88, security: 92, overall: 88 },
    { name: 'Svelte', performance: 92, learningCurve: 85, maintainability: 85, security: 85, overall: 87 }
  ];

  public scoreDatabase(name: string): ITechScores {
    return this.database.find(t => t.name === name) || 
      { name, performance: 70, learningCurve: 70, maintainability: 70, security: 70, overall: 70 };
  }

  public scoreFrontend(name: string): ITechScores {
    return this.frontend.find(t => t.name === name) || 
      { name, performance: 70, learningCurve: 70, maintainability: 70, security: 70, overall: 70 };
  }
}

export const technologyScoringEngine = new TechnologyScoringEngine();
export default technologyScoringEngine;
