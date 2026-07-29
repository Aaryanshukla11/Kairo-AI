import { RiskLevel, SecurityIssue } from './securityTypes';

export interface SecurityRule {
  id: string;
  title: string;
  description: string;
  severity: RiskLevel;
  check: (task: any) => boolean;
}

export class SecurityRules {
  private rules: SecurityRule[] = [];

  constructor() {
    this.initRules();
  }

  private initRules(): void {
    // 1. Unsafe file deletion
    this.rules.push({
      id: 'SEC-001',
      title: 'Unsafe File Deletion',
      description: 'Detection of deletion operations affecting core project structures.',
      severity: RiskLevel.High,
      check: (task) => {
        const type = task.type || '';
        const title = (task.title || '').toLowerCase();
        return type.toLowerCase() === 'delete' || title.includes('delete') || title.includes('remove');
      }
    });

    // 2. Shell command injections/risks
    this.rules.push({
      id: 'SEC-002',
      title: 'Dangerous Shell Commands',
      description: 'Executions of direct download scripts, admin commands, or write-access shell parameters.',
      severity: RiskLevel.Critical,
      check: (task) => {
        const desc = (task.description || '').toLowerCase();
        const title = (task.title || '').toLowerCase();
        const cmd = desc + ' ' + title;
        return (
          cmd.includes('curl') ||
          cmd.includes('wget') ||
          cmd.includes('chmod') ||
          cmd.includes('sudo') ||
          cmd.includes('rm -rf') ||
          cmd.includes('chown')
        );
      }
    });

    // 3. Credential/Secrets exposure
    this.rules.push({
      id: 'SEC-003',
      title: 'Hardcoded Secrets/Credentials',
      description: 'Potential exposure of tokens, authorization credentials, passwords, or API keys in the instructions.',
      severity: RiskLevel.Critical,
      check: (task) => {
        const desc = (task.description || '').toLowerCase();
        const title = (task.title || '').toLowerCase();
        const text = desc + ' ' + title;
        return (
          text.includes('api_key') ||
          text.includes('secret_key') ||
          text.includes('password') ||
          text.includes('token') ||
          text.includes('auth')
        );
      }
    });

    // 4. Large scale modifications
    this.rules.push({
      id: 'SEC-004',
      title: 'Large-scale Project Modifications',
      description: 'Operations affecting more than 5 distinct files or modules simultaneously.',
      severity: RiskLevel.Medium,
      check: (task) => {
        const files = task.affectedFiles || [];
        return files.length > 5;
      }
    });

    // 5. Dangerous permissions / dependencies risks
    this.rules.push({
      id: 'SEC-005',
      title: 'Dependency Configuration Changes',
      description: 'Additions or removals of external packages or scripts config files.',
      severity: RiskLevel.Low,
      check: (task) => {
        const files = task.affectedFiles || [];
        return files.some((f: string) => f.includes('package.json') || f.includes('package-lock.json'));
      }
    });
  }

  public evaluate(task: any): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    for (const rule of this.rules) {
      if (rule.check(task)) {
        issues.push({
          id: `iss-${Math.round(Math.random() * 100000)}`,
          ruleId: rule.id,
          title: rule.title,
          description: rule.description,
          severity: rule.severity,
          location: task.id
        });
      }
    }
    return issues;
  }
}

export const securityRules = new SecurityRules();
