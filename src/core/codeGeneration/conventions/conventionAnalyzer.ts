import { conventionDetector } from './conventionDetector';
import { conventionScorer } from './conventionScorer';
import { conventionValidator } from './conventionValidator';
import { conventionEvents } from './conventionEvents';
import { conventionMetrics } from './conventionMetrics';
import { conventionCache } from './conventionCache';
import { ConventionProfile, ConventionEventType } from './conventionTypes';
import { conventionRegistry } from './conventionRegistry';
import { typescriptRules } from './ruleProviders/typescriptRules';
import { javascriptRules } from './ruleProviders/javascriptRules';
import { reactRules } from './ruleProviders/reactRules';
import { nodeRules } from './ruleProviders/nodeRules';

export class ConventionAnalyzer {
  constructor() {
    conventionRegistry.register(typescriptRules);
    conventionRegistry.register(javascriptRules);
    conventionRegistry.register(reactRules);
    conventionRegistry.register(nodeRules);
  }

  public analyze(files: { path: string; content: string }[]): ConventionProfile {
    conventionEvents.emit(ConventionEventType.ConventionScanStarted, { filesCount: files.length });

    conventionValidator.validateSamplesCount(files.length);

    let camelCount = 0;
    let snakeCount = 0;
    let pascalCount = 0;

    for (const f of files) {
      const fileName = f.path.split('/').pop() || '';
      const casing = conventionDetector.detectCasing(fileName);
      conventionEvents.emit(ConventionEventType.PatternDetected, { file: f.path, casing });

      if (casing === 'camelCase') camelCount++;
      else if (casing === 'snakeCase') snakeCount++;
      else if (casing === 'PascalCase') pascalCount++;
    }

    const totalCount = files.length;
    let primaryCasing: 'camelCase' | 'snakeCase' | 'PascalCase' = 'camelCase';
    let casingMatches = camelCount;

    if (snakeCount > casingMatches) {
      primaryCasing = 'snakeCase';
      casingMatches = snakeCount;
    }
    if (pascalCount > casingMatches) {
      primaryCasing = 'PascalCase';
      casingMatches = pascalCount;
    }

    const confidence = conventionScorer.calculateConfidence(casingMatches, totalCount);

    const profile: ConventionProfile = {
      projectId: `project-conv-${Date.now()}`,
      namingRules: { casing: primaryCasing, confidence },
      folderRules: [
        { path: 'src/core', convention: 'camelCase' },
        { path: 'src/webview', convention: 'camelCase' }
      ],
      importRules: { style: 'relative', confidence: 0.9 },
      architectureRules: [
        { layersCheck: true, constraintRule: 'No core import inside common' }
      ],
      formattingRules: { useTabs: false, tabSize: 2 },
      codeStyleRules: { allowAny: false, strictNulls: true },
      confidence
    };

    conventionValidator.validateProfile(profile);
    conventionCache.set(profile);
    conventionMetrics.record(true);

    conventionEvents.emit(ConventionEventType.ConventionLearned, { profile });
    conventionEvents.emit(ConventionEventType.ProfileGenerated, { profile });
    conventionEvents.emit(ConventionEventType.ConventionValidated, { profile });
    conventionEvents.emit(ConventionEventType.ConventionReady, { profile });

    return profile;
  }
}

export const conventionAnalyzer = new ConventionAnalyzer();
