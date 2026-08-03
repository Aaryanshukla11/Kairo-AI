import { CollectedFileItem } from '../datasetCollector/collectorTypes';

export class RepairEngine {
  public repairSample(sample: CollectedFileItem): { repairedContent: string; repairedProvenance: any; repairsApplied: string[] } {
    let content = sample.content || '';
    const provenance = { ...sample.provenance };
    const repairsApplied: string[] = [];

    // 1. Repair truncated JSON files (by closing unclosed braces/brackets)
    const ext = (sample.filePath || '').split('.').pop()?.toLowerCase();
    if (ext === 'json') {
      const jsonRepair = this.tryRepairJson(content);
      if (jsonRepair.repaired) {
        content = jsonRepair.content;
        repairsApplied.push('Closed unclosed JSON braces/brackets');
      }
    }

    // 2. Remove control characters
    const controlCharRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g;
    if (controlCharRegex.test(content)) {
      content = content.replace(controlCharRegex, '');
      repairsApplied.push('Stripped unprintable ASCII control characters');
    }

    // 3. Repair missing provenance identifiers
    if (!provenance.sampleId) {
      provenance.sampleId = `sample-repaired-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      repairsApplied.push('Generated missing sample ID');
    }

    return {
      repairedContent: content,
      repairedProvenance: provenance,
      repairsApplied
    };
  }

  private tryRepairJson(content: string): { content: string; repaired: boolean } {
    const trimmed = content.trim();
    if (trimmed.length === 0) return { content, repaired: false };

    // Check if it is parseable as-is
    try {
      JSON.parse(trimmed);
      return { content: trimmed, repaired: false };
    } catch {
      // JSON is broken; let's see if we can close it
      let repairedContent = trimmed;
      const openBraces = (trimmed.match(/\{/g) || []).length;
      const closeBraces = (trimmed.match(/\}/g) || []).length;
      const openBrackets = (trimmed.match(/\[/g) || []).length;
      const closeBrackets = (trimmed.match(/\]/g) || []).length;

      let added = false;
      
      // Close open brackets
      if (openBrackets > closeBrackets) {
        repairedContent += ']'.repeat(openBrackets - closeBrackets);
        added = true;
      }
      // Close open braces
      if (openBraces > closeBraces) {
        repairedContent += '}'.repeat(openBraces - closeBraces);
        added = true;
      }

      // Check if it parses now
      try {
        JSON.parse(repairedContent);
        return { content: repairedContent, repaired: true };
      } catch {
        // If still broken, return original
        return { content, repaired: false };
      }
    }
  }
}

export const repairEngine = new RepairEngine();
