import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { IndexerEngine } from '../../src/core/indexer/indexerEngine';
import { SymbolType } from '../../src/core/indexer/indexTypes';

describe('Project Indexer Engine Tests', () => {
  const tempWorkspace = path.resolve(__dirname, '../../temp-indexer-workspace');
  let engine: IndexerEngine;

  before(() => {
    if (!fs.existsSync(tempWorkspace)) {
      fs.mkdirSync(tempWorkspace);
    }
    engine = new IndexerEngine(tempWorkspace);
  });

  after(() => {
    if (fs.existsSync(tempWorkspace)) {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });

  describe('Indexing Lifecycle', () => {
    it('should build, validate, search, and update project index semantic models', () => {
      const file1 = 'src/service.ts';
      const file2 = 'package.json';
      const abs1 = path.resolve(tempWorkspace, file1);
      const abs2 = path.resolve(tempWorkspace, file2);

      fs.mkdirSync(path.dirname(abs1), { recursive: true });
      fs.writeFileSync(
        abs1, 
        `import { config } from "./config";
         export class UserService {
           public getUser() { return "Aaryan"; }
         }`,
        'utf8'
      );
      fs.writeFileSync(
        abs2, 
        JSON.stringify({
          name: 'semantic-app',
          dependencies: { react: '^18.0.0' }
        }),
        'utf8'
      );

      const index = engine.startIndexing('ws-abc');

      assert.ok(index.id);
      assert.strictEqual(index.workspaceId, 'ws-abc');
      assert.strictEqual(index.framework, 'React');
      assert.strictEqual(index.language, 'JavaScript');

      const userSym = index.symbols.find(s => s.name === 'UserService');
      assert.ok(userSym);
      assert.strictEqual(userSym.type, SymbolType.Class);

      assert.strictEqual(index.dependencies.length, 1);
      assert.strictEqual(index.dependencies[0].targetFilePath, './config');

      fs.writeFileSync(
        abs1,
        `export interface User { id: string; }
         export function fetchUser() {}`,
        'utf8'
      );

      engine.updateIndexFile(file1);

      const updatedIndex = engine.getIndex();
      assert.ok(updatedIndex);

      const oldSym = updatedIndex.symbols.find(s => s.name === 'UserService');
      assert.strictEqual(oldSym, undefined);

      const interfaceSym = updatedIndex.symbols.find(s => s.name === 'User');
      assert.ok(interfaceSym);
      assert.strictEqual(interfaceSym.type, SymbolType.Interface);

      const funcSym = updatedIndex.symbols.find(s => s.name === 'fetchUser');
      assert.ok(funcSym);
      assert.strictEqual(funcSym.type, SymbolType.Function);
    });

    it('should throw validation error on duplicate symbols', () => {
      const builder = require('../../src/core/indexer/indexBuilder').indexBuilder;
      const file1 = 'src/service.ts';
      const abs1 = path.resolve(tempWorkspace, file1);

      fs.writeFileSync(
        abs1,
        `export class DuplicateClass {}
         export class DuplicateClass {}`,
        'utf8'
      );

      assert.throws(() => {
        builder.buildIndex(tempWorkspace, 'ws-dup');
      }, /Duplicate symbol detected/);
    });
  });
});
