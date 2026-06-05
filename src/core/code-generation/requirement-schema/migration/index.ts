import { IEnterpriseRequirement } from '../contracts';

export interface ISchemaMigrator {
  sourceVersion: string;
  targetVersion: string;
  migrate(req: any): any;
}

export class SchemaMigrationEngine {
  private migrators = new Map<string, ISchemaMigrator>();

  public registerMigrator(migrator: ISchemaMigrator): void {
    const key = `${migrator.sourceVersion}->${migrator.targetVersion}`;
    this.migrators.set(key, migrator);
  }

  public migrate(req: any, targetVersion: string): IEnterpriseRequirement {
    let current = { ...req };
    let currentVersion = current.versionInfo?.schemaVersion || '0.1.0';

    if (currentVersion === targetVersion) {
      return Object.freeze(current) as IEnterpriseRequirement;
    }

    // Run migration step if migrator registered
    const key = `${currentVersion}->${targetVersion}`;
    const migrator = this.migrators.get(key);
    if (migrator) {
      current = migrator.migrate(current);
      current.versionInfo.migrationVersion = targetVersion;
      current.versionInfo.lastUpdated = Date.now();
    }

    return Object.freeze(current) as IEnterpriseRequirement;
  }
}

export const schemaMigrationEngine = new SchemaMigrationEngine();
export default schemaMigrationEngine;
