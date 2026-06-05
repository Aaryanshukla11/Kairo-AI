export class ScaffoldingRulesModeler {
  public getDependencyRules(layoutType: string): string[] {
    return [
      'Circular package dependencies are strictly forbidden.',
      'Internal packages must never depend directly on client applications.',
      'Shared configurations must act as read-only configurations sources.'
    ];
  }

  public getBuildStrategy(layoutType: string): string {
    if (layoutType === 'Monorepo') {
      return 'Incremental Turborepo builds sequencing: Shared Packages first, then Apps.';
    }
    return 'Standard Vite compile output bundling.';
  }

  public getConfigurationLocations(layoutType: string): Record<string, string> {
    if (layoutType === 'Monorepo' || layoutType === 'MultiPackage') {
      return {
        tsconfig: 'tsconfig.json (workspace level root)',
        prettier: '.prettierrc (workspace level root)',
        env: 'apps/backend/.env'
      };
    }
    return {
      tsconfig: 'tsconfig.json (root)',
      prettier: '.prettierrc (root)',
      env: '.env'
    };
  }
}

export const scaffoldingRulesModeler = new ScaffoldingRulesModeler();
export default scaffoldingRulesModeler;
