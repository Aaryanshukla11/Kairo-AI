import * as fs from 'fs';
import * as path from 'path';
import { IValidationProvider, ValidationContext, ValidationResult } from './validationTypes';

export class InterfaceValidator implements IValidationProvider {
  public readonly id = 'interface-validator';
  public readonly name = 'Interface Contract Validator';
  public readonly targetSubsystem = 'Interfaces';

  private baseDir: string;

  constructor(baseDir: string = path.resolve(__dirname, '../../')) {
    this.baseDir = baseDir;
  }

  public async validate(context: ValidationContext): Promise<ValidationResult> {
    const coreDir = path.join(this.baseDir, 'core');
    const errors: string[] = [];
    const warnings: string[] = [];

    const interfaceMap = new Map<string, string[]>(); // interfaceName -> filePaths[]

    const traverse = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          traverse(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const interfaceRegex = /export\s+interface\s+(\w+)/g;
          
          let match;
          while ((match = interfaceRegex.exec(content)) !== null) {
            const intfName = match[1];
            const relPath = path.relative(this.baseDir, fullPath).replace(/\\/g, '/');
            if (!interfaceMap.has(intfName)) {
              interfaceMap.set(intfName, []);
            }
            interfaceMap.get(intfName)!.push(relPath);
          }
        }
      }
    };

    traverse(coreDir);

    let duplicatesCount = 0;
    for (const [intf, files] of interfaceMap.entries()) {
      if (files.length > 1) {
        duplicatesCount++;
        // Ignore standard names or generic ones if they are local, but warn about others
        warnings.push(`Duplicate Interface Name '${intf}' found in: ${files.join(', ')}`);
      }
    }

    let score = 100;
    if (duplicatesCount > 0) {
      score -= Math.min(15, duplicatesCount * 3);
    }

    score = Math.max(0, score);
    const status = score >= 90 ? 'Passed' : score >= 60 ? 'Warning' : 'Failed';

    return {
      name: this.name,
      status,
      score,
      details: `Validated ${interfaceMap.size} unique interfaces. Found ${duplicatesCount} duplicated interface declarations.`,
      errors,
      warnings,
      metrics: {
        totalInterfacesCount: interfaceMap.size,
        duplicateInterfacesCount: duplicatesCount
      }
    };
  }
}

export const interfaceValidator = new InterfaceValidator();
