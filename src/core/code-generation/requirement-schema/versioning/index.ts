import { ISchemaVersionInfo } from '../contracts';

export class SchemaVersioning {
  public static readonly CURRENT_VERSION = '1.0.0';
  public static readonly COMPATIBILITY_VERSION = '1.0.0';

  public createVersionInfo(): ISchemaVersionInfo {
    const now = Date.now();
    return {
      schemaVersion: SchemaVersioning.CURRENT_VERSION,
      creationTime: now,
      lastUpdated: now,
      compatibilityVersion: SchemaVersioning.COMPATIBILITY_VERSION,
      migrationVersion: SchemaVersioning.CURRENT_VERSION
    };
  }
}

export const schemaVersioning = new SchemaVersioning();
