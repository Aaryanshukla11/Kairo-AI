import * as assert from 'assert';
import { MemoryAgent } from '../../src/core/agents/memory/memoryAgent';
import { MemoryType } from '../../src/core/agents/memory/memoryTypes';
import { memoryValidator } from '../../src/core/agents/memory/memoryValidator';
import { memoryScorer } from '../../src/core/agents/memory/memoryScorer';
import { AgentStatus } from '../../src/core/agents/agentTypes';

describe('Memory Agent Tests', () => {
  let agent: MemoryAgent;

  before(() => {
    agent = new MemoryAgent({
      id: 'memory-agent',
      name: 'Memory Agent',
      role: 'Project Memory & Decisions QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 9,
      capabilities: ['recording', 'retrieval', 'compression'],
      permissions: ['READ', 'WRITE']
    });
  });

  beforeEach(() => {
    agent.brain.syncIndex();
    const all = agent.brain.getAll();
    for (const mem of all) {
      agent.brain.deleteMemory(mem.id);
    }
  });

  describe('Validation Rules', () => {
    it('should reject duplicate memory IDs', () => {
      const existing = new Set(['mem-1']);
      assert.throws(() => {
        memoryValidator.validate({ id: 'mem-1', title: 'T', content: 'C', type: MemoryType.ArchitectureDecision }, existing);
      }, /Duplicate memory ID/);
    });

    it('should reject empty memory titles or content', () => {
      assert.throws(() => {
        memoryValidator.validate({ id: 'mem-2', title: '', content: 'C', type: MemoryType.ArchitectureDecision }, new Set());
      }, /Title cannot be empty/);

      assert.throws(() => {
        memoryValidator.validate({ id: 'mem-3', title: 'T', content: '  ', type: MemoryType.ArchitectureDecision }, new Set());
      }, /Content cannot be empty/);
    });

    it('should reject invalid importance values', () => {
      assert.throws(() => {
        memoryValidator.validate({ id: 'mem-4', title: 'T', content: 'C', type: MemoryType.ArchitectureDecision, importance: 11 }, new Set());
      }, /Importance must be between 1 and 10/);
    });
  });

  describe('Memory CRUD & Search Operations', () => {
    it('should successfully create, retrieve, update, and delete memories', async () => {
      // 1. Create
      const taskCreate = {
        id: 'task-create-1',
        title: 'Save Architecture Decision',
        assignedAgentId: 'memory-agent',
        payload: {
          action: 'CREATE',
          memory: {
            id: 'decision-1',
            type: MemoryType.ArchitectureDecision,
            title: 'Use TypeScript for Extension',
            summary: 'Leverage static typing',
            content: 'Static type checking improves maintainability',
            importance: 8,
            tags: ['typescript', 'architecture'],
            relatedFiles: ['package.json'],
            relatedTasks: [],
            relatedCommits: []
          }
        },
        status: 'pending' as any
      };

      const resCreate = await agent.executeTask(taskCreate);
      assert.strictEqual(resCreate.success, true);
      assert.strictEqual(resCreate.result.id, 'decision-1');

      // 2. Retrieve (Search)
      const taskSearch = {
        id: 'task-search-1',
        title: 'Search architecture memories',
        assignedAgentId: 'memory-agent',
        payload: {
          action: 'SEARCH',
          filter: {
            query: 'typescript',
            type: MemoryType.ArchitectureDecision
          }
        },
        status: 'pending' as any
      };

      const resSearch = await agent.executeTask(taskSearch);
      assert.strictEqual(resSearch.success, true);
      assert.strictEqual(resSearch.result.length, 1);
      assert.strictEqual(resSearch.result[0].id, 'decision-1');
      assert.ok(resSearch.result[0].relevanceScore > 0);

      // 3. Update
      const taskUpdate = {
        id: 'task-update-1',
        title: 'Update importance',
        assignedAgentId: 'memory-agent',
        payload: {
          action: 'UPDATE',
          id: 'decision-1',
          updates: {
            importance: 10
          }
        },
        status: 'pending' as any
      };

      const resUpdate = await agent.executeTask(taskUpdate);
      assert.strictEqual(resUpdate.success, true);
      assert.strictEqual(resUpdate.result.importance, 10);

      // 4. Delete
      const taskDelete = {
        id: 'task-delete-1',
        title: 'Delete memory',
        assignedAgentId: 'memory-agent',
        payload: {
          action: 'DELETE',
          id: 'decision-1'
        },
        status: 'pending' as any
      };

      const resDelete = await agent.executeTask(taskDelete);
      assert.strictEqual(resDelete.success, true);
      assert.strictEqual(agent.brain.getAll().length, 0);
    });
  });

  describe('Relevance Scoring', () => {
    it('should compute scores favoring higher importance and query match overlap', () => {
      const memoryHigh = {
        id: 'm-high',
        type: MemoryType.ArchitectureDecision,
        title: 'High Importance Decision',
        summary: '',
        content: 'TypeScript architecture decisions details',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        importance: 10,
        tags: ['typescript'],
        relatedFiles: [],
        relatedTasks: [],
        relatedCommits: []
      };

      const memoryLow = {
        id: 'm-low',
        type: MemoryType.ArchitectureDecision,
        title: 'Low Importance Decision',
        summary: '',
        content: 'TypeScript details',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        importance: 2,
        tags: ['typescript'],
        relatedFiles: [],
        relatedTasks: [],
        relatedCommits: []
      };

      const scoreHigh = memoryScorer.score(memoryHigh, ['typescript']);
      const scoreLow = memoryScorer.score(memoryLow, ['typescript']);

      assert.ok(scoreHigh > scoreLow, 'High importance memory should score higher than low importance');
    });
  });

  describe('Compression', () => {
    it('should consolidate low importance execution histories when count is high', async () => {
      // Create 6 low importance execution summaries
      for (let i = 1; i <= 6; i++) {
        agent.brain.createMemory({
          id: `exec-${i}`,
          type: MemoryType.ExecutionSummary,
          title: `Run ${i}`,
          summary: `Summary of run ${i}`,
          content: `Details of run ${i}`,
          importance: 3,
          tags: ['execution'],
          relatedFiles: [],
          relatedTasks: [],
          relatedCommits: []
        });
      }

      assert.strictEqual(agent.brain.getAll().length, 6);

      // Trigger compress task
      const taskCompress = {
        id: 'task-compress-1',
        title: 'Consolidate execution logs',
        assignedAgentId: 'memory-agent',
        payload: { action: 'COMPRESS' },
        status: 'pending' as any
      };

      const resCompress = await agent.executeTask(taskCompress);
      assert.strictEqual(resCompress.success, true);

      const allMemories = agent.brain.getAll();
      // Should delete the 6 older items and create 1 consolidated item, resulting in total length 1
      assert.strictEqual(allMemories.length, 1);
      assert.strictEqual(allMemories[0].type, MemoryType.ExecutionSummary);
      assert.ok(allMemories[0].title.includes('Consolidated Execution History'));
    });
  });
});
