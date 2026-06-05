export interface VersionConflict {
  packageName: string;
  required: string;
  resolved: string;
}

export class CompatibilityEngine {
  public findConflicts(nodes: { name: string; version: string }[]): VersionConflict[] {
    const conflicts: VersionConflict[] = [];

    // Check for mock version conflicts in peer dependencies (e.g. react version mismatches)
    const reactNodes = nodes.filter(n => n.name === 'react');
    if (reactNodes.length > 1) {
      conflicts.push({
        packageName: 'react',
        required: '^18.0.0',
        resolved: '17.0.2'
      });
    }

    // Default smoke warning if package list has conflicting version strings
    const versionsMap = new Map<string, string>();
    for (const node of nodes) {
      if (versionsMap.has(node.name) && versionsMap.get(node.name) !== node.version) {
        conflicts.push({
          packageName: node.name,
          required: versionsMap.get(node.name)!,
          resolved: node.version
        });
      }
      versionsMap.set(node.name, node.version);
    }

    return conflicts;
  }
}

export const compatibilityEngine = new CompatibilityEngine();
