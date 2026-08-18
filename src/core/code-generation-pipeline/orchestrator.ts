import { IDevelopmentRequest } from '../planning-validator-handoff/types';
import { IGenerationResult } from './types';
import { generatorSessionBuilder } from '../generator-session-builder';
import { codingRuntime } from '../coding-runtime';
import { ICodingModelProvider } from '../coding-runtime/types';
import { generationContractBuilder } from '../generation-contract';
import { generationResponseValidator } from '../generation-response-validator';
import * as crypto from 'crypto';
import * as path from 'path';

export class GenerationOrchestrator {
  public async executePipeline(
    request: IDevelopmentRequest,
    provider: ICodingModelProvider,
    onProgress?: (moduleName: string, progress: number) => void,
    workspacePath: string = '.'
  ): Promise<IGenerationResult> {
    const executionId = crypto.randomUUID ? crypto.randomUUID() : `gen-run-${Date.now()}`;
    const completedModules: string[] = [];
    const failedModules: string[] = [];
    const generatedContracts: any[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Group tasks by phase or module category
    const modulesToGenerate = request.executionPhases.length > 0
      ? request.executionPhases.map(p => p.phaseName)
      : ['Synthesis'];

    const totalModules = modulesToGenerate.length;

    const promptSummary = (request.projectInfo.description || request.projectInfo.name || '').substring(0, 50);
    console.log(`[GenerationOrchestrator] Production generation started - executionId: ${executionId}, prompt: "${promptSummary}", model: ${provider.providerId}`);

    for (let i = 0; i < totalModules; i++) {
      const moduleName = modulesToGenerate[i];
      if (onProgress) {
        onProgress(moduleName, Math.round((i / totalModules) * 100));
      }

      let attempt = 0;
      let success = false;
      let currentContract: any = null;
      const moduleErrors: string[] = [];

      while (attempt < 2 && !success) { // Retry module once if failed
        attempt++;
        const moduleStartTime = Date.now();
        try {
          // 1. Build Generator Session
          const session = generatorSessionBuilder.buildSession(request);

          // 2. Execute Coding Model
          console.log(`[GenerationOrchestrator] Calling coding runtime - executionId: ${executionId}, prompt: "${promptSummary}", model: ${provider.providerId}`);
          const callStartTime = Date.now();
          const runtimeResponse = await codingRuntime.execute(
            session,
            provider,
            { timeoutMs: 90000, maxRetries: 2 }
          );
          const callDuration = Date.now() - callStartTime;
          console.log(`[GenerationOrchestrator] Coding runtime returned - executionId: ${executionId}, status: ${runtimeResponse.status}, duration: ${callDuration}ms, model: ${provider.providerId}`);

          if (runtimeResponse.status !== 'SUCCESS') {
            throw new Error(`Runtime execution failed: ${runtimeResponse.errors?.join(', ') || 'Unknown error'}`);
          }

          // Parse raw model output into actual generated file operations
          let actualGeneratedOperations: any[] = [];
          const rawContent = (runtimeResponse.rawJsonContent || '').trim();
          const cleanedContent = rawContent.replace(/^```(?:json|html|xml|typescript|javascript|tsx|jsx)?\s*/i, '').replace(/\s*```$/i, '').trim();

          try {
            let parsed: any;
            try {
              parsed = JSON.parse(cleanedContent);
            } catch {
              // If direct JSON.parse failed, try extracting first {...} or [...] block
              const jsonMatch = cleanedContent.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
              if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[1]);
              }
            }

            const extractFilesArray = (obj: any): any[] | null => {
              if (!obj || typeof obj !== 'object') return null;
              if (Array.isArray(obj)) return obj;

              const fileArrayKeys = [
                'generatedFiles', 'generated_files',
                'modifiedFiles', 'modified_files',
                'createdFiles', 'created_files',
                'updatedFiles', 'updated_files',
                'fileOperations', 'file_operations',
                'operations', 'files', 'artifacts', 'changes'
              ];

              const foundFiles: any[] = [];

              for (const key of fileArrayKeys) {
                if (Array.isArray(obj[key]) && obj[key].length > 0) {
                  foundFiles.push(...obj[key]);
                } else if (obj[key] && Array.isArray(obj[key].items) && obj[key].items.length > 0) {
                  foundFiles.push(...obj[key].items);
                }
              }

              if (obj.properties && typeof obj.properties === 'object') {
                for (const key of fileArrayKeys) {
                  if (Array.isArray(obj.properties[key]) && obj.properties[key].length > 0) {
                    foundFiles.push(...obj.properties[key]);
                  } else if (obj.properties[key] && Array.isArray(obj.properties[key].items) && obj.properties[key].items.length > 0) {
                    foundFiles.push(...obj.properties[key].items);
                  }
                }
              }

              return foundFiles.length > 0 ? foundFiles : null;
            };

            const targetFilesScope: string[] = (request as any).targetFiles || [];
            const genFilesList = extractFilesArray(parsed);

            if (genFilesList && genFilesList.length > 0) {
              actualGeneratedOperations = genFilesList.map((f: any, idx: number) => {
                let targetRel = f.path || f.filePath || f.relativePath || f.name || `file-${idx + 1}.txt`;
                if (targetFilesScope.length === 1 && (targetRel.endsWith(targetFilesScope[0]) || targetFilesScope[0].endsWith(path.basename(targetRel)))) {
                  targetRel = targetFilesScope[0];
                }
                const absPath = path.isAbsolute(targetRel) ? targetRel : path.resolve(workspacePath, targetRel);

                let contentStr = '';
                if (typeof f.content === 'string') {
                  contentStr = f.content;
                } else if (Array.isArray(f.content)) {
                  contentStr = f.content.join('\n');
                } else if (typeof f.code === 'string') {
                  contentStr = f.code;
                } else if (Array.isArray(f.code)) {
                  contentStr = f.code.join('\n');
                } else if (typeof f.body === 'string') {
                  contentStr = f.body;
                } else if (typeof f === 'string') {
                  contentStr = f;
                }

                if (typeof contentStr === 'string' && contentStr.trim().startsWith('{')) {
                  try {
                    const innerObj = JSON.parse(contentStr);
                    if (innerObj) {
                      const innerArray = extractFilesArray(innerObj);
                      if (innerArray && innerArray[0] && typeof innerArray[0].content === 'string') {
                        contentStr = innerArray[0].content;
                      } else if (typeof innerObj.content === 'string') {
                        contentStr = innerObj.content;
                      } else if (typeof innerObj.code === 'string') {
                        contentStr = innerObj.code;
                      }
                    }
                  } catch {}
                }

                return {
                  operationId: `op-${moduleName}-${idx}-${Date.now()}`,
                  operationType: 'CREATE_FILE' as const,
                  filePath: absPath,
                  relativePath: targetRel,
                  language: f.language || (targetRel.endsWith('.html') ? 'HTML' : (targetRel.endsWith('.css') ? 'CSS' : 'TypeScript')),
                  encoding: 'utf-8',
                  content: contentStr,
                  reason: f.reason || `Generated ${targetRel}`,
                  dependencies: f.dependencies || []
                };
              });
            } else if (parsed && (parsed.filePath || parsed.path || parsed.targetFile) && (parsed.content || parsed.code)) {
              const targetRel = parsed.path || parsed.filePath || parsed.targetFile;
              const absPath = path.isAbsolute(targetRel) ? targetRel : path.resolve(workspacePath, targetRel);
              actualGeneratedOperations = [{
                operationId: `op-${moduleName}-0-${Date.now()}`,
                operationType: 'CREATE_FILE' as const,
                filePath: absPath,
                relativePath: targetRel,
                language: targetRel.endsWith('.html') ? 'HTML' : (targetRel.endsWith('.css') ? 'CSS' : 'TypeScript'),
                encoding: 'utf-8',
                content: parsed.content || parsed.code || '',
                reason: `Generated ${targetRel}`,
                dependencies: []
              }];
            }
          } catch (err: any) {
            console.warn('[GenerationOrchestrator] JSON parsing of model response failed. Attempting fallback raw content parsing...');
          }

          // Parse non-JSON markdown code block only if specific targetFiles were explicitly scoped in request
          if (actualGeneratedOperations.length === 0 && rawContent.length > 0) {
            const targetFilesScope: string[] = (request as any).targetFiles || [];
            if (targetFilesScope.length > 0) {
              const primaryTarget = targetFilesScope[0];
              const absPath = path.isAbsolute(primaryTarget) ? primaryTarget : path.resolve(workspacePath, primaryTarget);

              let extractedCode = rawContent;
              const codeBlockMatch = rawContent.match(/```(?:html|css|javascript|typescript|tsx|jsx)?\s*([\s\S]*?)\s*```/i);
              if (codeBlockMatch) {
                extractedCode = codeBlockMatch[1];
              }

              let unpackDepth = 0;
              while (unpackDepth < 3 && (extractedCode.trim().startsWith('{') || extractedCode.trim().startsWith('['))) {
                unpackDepth++;
                try {
                  const retryParsed = JSON.parse(extractedCode);
                  if (!retryParsed) break;

                  const retryArray = extractFilesArray(retryParsed);
                  if (retryArray && retryArray[0]) {
                    const item = retryArray[0];
                    const nextContent = typeof item.content === 'string' ? item.content : (typeof item.code === 'string' ? item.code : (typeof item.body === 'string' ? item.body : null));
                    if (nextContent !== null) {
                      extractedCode = nextContent;
                    } else {
                      break;
                    }
                  } else if (typeof retryParsed.content === 'string') {
                    extractedCode = retryParsed.content;
                  } else if (typeof retryParsed.code === 'string') {
                    extractedCode = retryParsed.code;
                  } else if (retryParsed.file && typeof retryParsed.file.content === 'string') {
                    extractedCode = retryParsed.file.content;
                  } else if (retryParsed.data && typeof retryParsed.data.content === 'string') {
                    extractedCode = retryParsed.data.content;
                  } else {
                    break;
                  }
                } catch {
                  break;
                }
              }

              actualGeneratedOperations = [{
                operationId: `op-${moduleName}-extracted-${Date.now()}`,
                operationType: 'CREATE_FILE' as const,
                filePath: absPath,
                relativePath: primaryTarget,
                language: primaryTarget.endsWith('.html') ? 'HTML' : (primaryTarget.endsWith('.css') ? 'CSS' : 'TypeScript'),
                encoding: 'utf-8',
                content: extractedCode,
                reason: `Extracted ${primaryTarget} from raw model output`,
                dependencies: []
              }];
            }
          }

          if (actualGeneratedOperations.length === 0) {
            throw new Error(`Generation Failed: Model returned empty or unparseable output for module '${moduleName}'. Pre-designed static fallbacks are disabled.`);
          }

          // Standardize path resolution on all actualGeneratedOperations
          actualGeneratedOperations = actualGeneratedOperations.map(op => {
            const rel = op.relativePath || op.filePath || 'file.txt';
            const absPath = path.isAbsolute(rel) ? rel : path.resolve(workspacePath, rel);
            return {
              ...op,
              filePath: absPath,
              relativePath: rel
            };
          });

          console.log(`[GenerationOrchestrator] ${actualGeneratedOperations.length} file operations parsed from model output for module "${moduleName}".`);

          // 3. Convert and validate Generation Contract from actual generated operations
          const contractDraft = {
            contractVersion: '1.0.0',
            requestId: request.requestId,
            executionId,
            fileOperations: actualGeneratedOperations,
            directoryOperations: [],
            warnings: [],
            errors: [],
            metadata: {
              generator: `${moduleName}Generator`,
              timestamp: Date.now(),
              model: provider.providerId,
              projectId: request.projectInfo?.name || request.requestId || executionId
            }
          };

          const contract = generationContractBuilder.createContract(contractDraft);

          // 4. Run Generation Response Validator
          const validation = generationResponseValidator.validateContract(contract);
          if (!validation.report.isValid) {
            throw new Error(`Validation failed: ${validation.report.issues.map(i => i.message).join(', ')}`);
          }

          currentContract = validation.validatedContract;
          success = true;
          const durationMs = Date.now() - moduleStartTime;
          console.log(`[GenerationOrchestrator] Generation contract created - executionId: ${executionId}, operationsCount: ${actualGeneratedOperations.length}, duration: ${durationMs}ms, status: SUCCESS`);
        } catch (err: any) {
          const durationMs = Date.now() - moduleStartTime;
          console.log(`[GenerationOrchestrator] Generation contract created - executionId: ${executionId}, operationsCount: 0, duration: ${durationMs}ms, status: FAILED (${err.message})`);
          moduleErrors.push(`Attempt ${attempt} failed: ${err.message}`);
        }
      }

      if (success && currentContract) {
        completedModules.push(moduleName);
        generatedContracts.push(currentContract);
      } else {
        failedModules.push(moduleName);
        errors.push(`Module '${moduleName}' generation failed: ${moduleErrors.join('; ')}`);
      }
    }

    if (onProgress) {
      onProgress('Completed', 100);
    }

    return {
      executionId,
      completedModules: Object.freeze(completedModules),
      failedModules: Object.freeze(failedModules),
      generatedContracts: Object.freeze(generatedContracts),
      warnings: Object.freeze(warnings),
      errors: Object.freeze(errors)
    };
  }
}

export const generationOrchestrator = new GenerationOrchestrator();
export default generationOrchestrator;
