import { IDecisionDetails } from '../schema';

export class RecommendationAdvisor {
  public resolveLanguage(preferred: string | null): IDecisionDetails {
    const isTS = preferred === 'TypeScript' || !preferred;
    return {
      primary: isTS ? 'TypeScript' : preferred!,
      secondary: isTS ? 'JavaScript' : 'TypeScript',
      enterprise: 'TypeScript',
      experimental: 'Rust',
      rationale: [
        'TypeScript provides strong static typing compilation validation',
        'TypeScript is preferred for large-scale enterprise microservices'
      ],
      tradeOffs: 'Higher initial setup latency but lower runtime production bugs counts.'
    };
  }

  public resolveDatabase(preferred: string | null): IDecisionDetails {
    const isPostgres = preferred === 'PostgreSQL' || !preferred;
    return {
      primary: isPostgres ? 'PostgreSQL' : preferred!,
      secondary: isPostgres ? 'MySQL' : 'PostgreSQL',
      enterprise: 'PostgreSQL',
      experimental: 'SurrealDB',
      rationale: [
        'Excellent relational integrity validations support',
        'Highly extensible and supports JSON data fields natively'
      ],
      tradeOffs: 'Requires schema migration maintenance over simpler key-value databases.'
    };
  }

  public resolveFrontend(preferred: string | null): IDecisionDetails {
    const isReact = preferred === 'React' || !preferred;
    return {
      primary: isReact ? 'React' : preferred!,
      secondary: isReact ? 'Next.js' : 'React',
      enterprise: 'React',
      experimental: 'SolidJS',
      rationale: [
        'Vast components library options ecosystem',
        'Unidirectional data bindings enforce predictable renders loops'
      ],
      tradeOffs: 'Virtual DOM adds slight memory weight compared to vanilla options.'
    };
  }
}

export const recommendationAdvisor = new RecommendationAdvisor();
export default recommendationAdvisor;
