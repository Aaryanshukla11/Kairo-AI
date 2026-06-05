import * as fs from 'fs';
import * as path from 'path';
import { IValidationProvider, ValidationContext, ValidationResult } from './validationTypes';

export class ArchitectureAuditor implements IValidationProvider {
  public readonly id = 'architecture-auditor';
  public readonly name = 'Architecture Auditor';
  public readonly targetSubsystem = 'Architecture';

  private baseDir: string;

  constructor(baseDir: string = path.resolve(__dirname, '../../')) {
    this.baseDir = baseDir;
  }

  public async validate(context: ValidationContext): Promise<ValidationResult> {
    const coreDir = path.join(this.baseDir, 'core');
    const errors: string[] = [];
    const warnings: string[] = [];

    let totalFilesChecked = 0;
    let namingViolationsCount = 0;
    let singletonPatternCount = 0;
    let providerContractsChecked = 0;

    const traverse = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          traverse(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          totalFilesChecked++;
          
          // Check Naming consistency
          // Rule: Files should be camelCase or index.ts, or types.ts
          const baseName = path.basename(entry.name, path.extname(entry.name));
          const isCamelCase = /^[a-z]+[a-zA-Z0-9]*$/.test(baseName);
          const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(baseName);
          
          if (!isCamelCase && !isPascalCase && baseName !== 'index') {
            namingViolationsCount++;
            warnings.push(`Naming Inconsistency: File '${entry.name}' does not follow camelCase or PascalCase conventions.`);
          }

          // Check for singleton export styles (e.g. export const name = new Name())
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes('export const ') && content.includes(' = new ')) {
            singletonPatternCount++;
          }

          // Check configuration loads
          if (content.includes('process.env') && !content.includes('config') && !fullPath.includes('config')) {
            warnings.push(`Config Warning: Direct access of process.env in '${path.relative(this.baseDir, fullPath)}' without using configuration loader.`);
          }

          // Check provider contracts
          if (entry.name.endsWith('Provider.ts') || entry.name.endsWith('provider.ts')) {
            providerContractsChecked++;
            if (!content.includes('interface ') && !content.includes('implements ') && !content.includes('abstract class ')) {
              warnings.push(`Provider Contract: Provider file '${entry.name}' does not seem to define or implement an interface or abstract class.`);
            }
          }
        }
      }
    };

    traverse(coreDir);

    let score = 100;
    if (namingViolationsCount > 0) {
      score -= Math.min(10, namingViolationsCount * 2);
    }
    if (errors.length > 0) {
      score -= Math.min(40, errors.length * 10);
    }

    score = Math.max(0, score);
    const status = score >= 90 ? 'Passed' : score >= 60 ? 'Warning' : 'Failed';

    return {
      name: this.name,
      status,
      score,
      details: `Audited ${totalFilesChecked} files inside core. Found ${namingViolationsCount} naming violations, verified ${singletonPatternCount} singletons, and checked ${providerContractsChecked} providers.`,
      errors,
      warnings,
      metrics: {
        totalFilesChecked,
        namingViolationsCount,
        singletonPatternCount,
        providerContractsChecked
      }
    };
  }
}

export const architectureAuditor = new ArchitectureAuditor();
