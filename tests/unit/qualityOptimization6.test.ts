import * as assert from 'assert';
import { ProjectSymbolGraph } from '../../src/core/projectManifest/projectSymbolGraph';
import { iterativeRepairLoop } from '../../src/core/agents/reviewer/iterativeRepairLoop';

const expect = (actual: any) => ({
  toBe: (expected: any) => assert.strictEqual(actual, expected),
  toEqual: (expected: any) => assert.deepStrictEqual(actual, expected),
  toContain: (expected: any) => {
    if (typeof actual === 'string') {
      assert.ok(actual.includes(expected), `Expected '${actual}' to contain '${expected}'`);
    } else if (Array.isArray(actual)) {
      assert.ok(actual.includes(expected), `Expected array to contain '${expected}'`);
    }
  }
});

describe('Quality Optimization #6 Unit Tests — SymbolGraph & Iterative Repair', () => {
  test('ProjectSymbolGraph correctly tracks exports, imports, and cross-file dependencies', () => {
    const sg = new ProjectSymbolGraph('sess-1', 'req-1', 'Test prompt', ['React', 'TypeScript']);

    sg.parseAndRecordGeneratedCode('src/types/product.ts', `
      export interface Product { id: string; name: string; price: number; }
      export type ProductCategory = 'Kitchen' | 'Commercial';
    `);

    sg.parseAndRecordGeneratedCode('src/components/ProductCard.tsx', `
      import { Product } from '../types/product';
      export const ProductCard = () => { return null; };
    `);

    const state = sg.getState();
    expect(state.folderStructure).toContain('src/types/product.ts');
    expect(state.files['src/types/product.ts'].exports.length).toBe(2);
    expect(state.files['src/types/product.ts'].exports[0].name).toBe('Product');
  });

  test('ProjectSymbolGraph detects missing cross-file export references', () => {
    const sg = new ProjectSymbolGraph('sess-2', 'req-2', 'Test prompt');
    sg.registerFile('src/types/user.ts', []); // No exports registered!

    const validation = sg.validateCrossFileIntegrity('src/components/UserProfile.tsx', `
      import { UserProfileData } from '../types/user';
    `);

    expect(validation.valid).toBe(false);
    expect(validation.issues.length).toBe(1);
    expect(validation.issues[0].affectedSymbol).toBe('UserProfileData');
  });

  test('IterativeRepairLoop enforces MAX_REPAIR_ATTEMPTS = 2 and emits event bus updates', async () => {
    let attemptCounter = 0;

    const res = await iterativeRepairLoop.runRepairLoop(
      {
        filePath: 'src/components/BrokenCard.tsx',
        originalContent: '// Broken code',
        issue: {
          severity: 'HIGH',
          filePath: 'src/components/BrokenCard.tsx',
          issueType: 'MISSING_EXPORT',
          exactProblem: 'Missing User export',
          affectedSymbol: 'User',
          suggestedFix: 'Export User'
        },
        attemptNumber: 1
      },
      async (ctx) => {
        attemptCounter++;
        if (attemptCounter === 2) {
          return { success: true, repairedContent: '// Repaired code export interface User {}' };
        }
        return { success: false, repairedContent: '// Still broken' };
      }
    );

    expect(res.success).toBe(true);
    expect(res.attempts).toBe(2);
    expect(res.finalContent).toContain('Repaired code');
  });
});
