import * as fs from 'fs';
import * as path from 'path';
import { IValidationProvider, ValidationContext, ValidationResult } from './validationTypes';

export class ProviderValidator implements IValidationProvider {
  public readonly id = 'provider-validator';
  public readonly name = 'Provider Contract Validator';
  public readonly targetSubsystem = 'Providers';

  private baseDir: string;

  constructor(baseDir: string = path.resolve(__dirname, '../../')) {
    this.baseDir = baseDir;
  }

  public async validate(context: ValidationContext): Promise<ValidationResult> {
    const coreDir = path.join(this.baseDir, 'core');
    const errors: string[] = [];
    const warnings: string[] = [];

    const providerFiles: string[] = [];
    
    const findProviders = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findProviders(fullPath);
        } else if (entry.isFile() && entry.name.toLowerCase().includes('provider.ts')) {
          providerFiles.push(fullPath);
        }
      }
    };

    findProviders(coreDir);

    let checkedCount = 0;
    let missingSingletonExport = 0;

    for (const file of providerFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      checkedCount++;

      // Check if it has class and standard methods or exports a default instance
      const hasClass = content.includes('class ') || content.includes('interface ');
      const hasExportInstance = content.includes('export const ') || content.includes('export default ');

      if (hasClass && !hasExportInstance) {
        missingSingletonExport++;
        warnings.push(`Provider Singleton Check: '${path.relative(this.baseDir, file)}' defines a provider class but does not export an instantiated singleton.`);
      }
    }

    let score = 100;
    if (missingSingletonExport > 0) {
      score -= Math.min(20, missingSingletonExport * 4);
    }

    score = Math.max(0, score);
    const status = score >= 90 ? 'Passed' : score >= 60 ? 'Warning' : 'Failed';

    return {
      name: this.name,
      status,
      score,
      details: `Scanned ${providerFiles.length} provider files inside core. Validated singleton export conventions and basic provider structural contract compatibility.`,
      errors,
      warnings,
      metrics: {
        providersChecked: checkedCount,
        missingSingletonExportCount: missingSingletonExport
      }
    };
  }
}

export const providerValidator = new ProviderValidator();
