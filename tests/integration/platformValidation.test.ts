import * as assert from 'assert';
import * as path from 'path';
import { platformValidationEngine } from '../../src/core/platformValidation/platformValidationEngine';
import { dependencyGraph } from '../../src/core/platformValidation/dependencyGraph';
import { moduleBoundaryValidator } from '../../src/core/platformValidation/moduleBoundaryValidator';
import { checkpointRegistry } from '../../src/core/checkpointManager/checkpointRegistry';
import { artifactRegistryProvider } from '../../src/core/checkpointManager/providers/artifactRegistryProvider';
import { eventBusInstance } from '../../src/core/eventBus/eventBus';
import { eventRegistry } from '../../src/core/eventBus/eventRegistry';
import { AIIdleEvent } from '../../src/core/eventBus/eventTypes';
import { architectureHealth } from '../../src/core/platformValidation/architectureHealth';

describe('Platform Stabilization & Validation Integration Tests', () => {
  
  describe('Dependency Graph & Circular Dependency Detector', () => {
    it('should scan workspace directories and construct a dependency graph', () => {
      const graph = dependencyGraph.generate();
      assert.ok(graph.nodes.length > 0, 'Should find at least some nodes in workspace');
      assert.ok(Array.isArray(graph.circularPaths), 'Circular paths should be an array');
      assert.ok(Array.isArray(graph.unusedModules), 'Unused modules should be an array');
      assert.ok(Array.isArray(graph.duplicateProviders), 'Duplicate providers should be an array');
    });
  });

  describe('Module Boundary Validator', () => {
    it('should analyze module boundaries and report violations and layer leaks', async () => {
      const result = await moduleBoundaryValidator.validate({ timestamp: Date.now() });
      assert.strictEqual(result.name, 'Module Boundary Validator');
      assert.ok(result.score >= 0 && result.score <= 100, 'Score should be between 0 and 100');
      assert.ok(result.metrics, 'Metrics should be populated');
      
      const staticReport = moduleBoundaryValidator.getBoundaryReport();
      assert.ok(Array.isArray(staticReport.layerLeaks), 'Layer leaks should be an array');
    });
  });

  describe('Registry Integrity Validator', () => {
    it('should validate checkpoint registry lifecycle and immutability contracts', () => {
      const mockChk = {
        checkpointId: 'test-chk-intg',
        epoch: 1,
        step: 10,
        timestamp: Date.now(),
        path: '/tmp/chk',
        metrics: {},
        metadata: {}
      };
      
      checkpointRegistry.registerCheckpoint(mockChk as any);
      const retrieved = checkpointRegistry.getCheckpoint('test-chk-intg');
      assert.deepStrictEqual(retrieved, mockChk);
      
      // Immutability Check: Registering same ID should throw
      assert.throws(() => {
        checkpointRegistry.registerCheckpoint(mockChk as any);
      }, /already exists/);
      
      checkpointRegistry.removeCheckpoint('test-chk-intg');
    });

    it('should validate artifact registry provider push/pull operations', () => {
      const mockChk = {
        checkpointId: 'test-art-intg',
        epoch: 2,
        step: 20,
        timestamp: Date.now(),
        path: '/tmp/art',
        metrics: {},
        metadata: {}
      };
      
      artifactRegistryProvider.pushArtifact(mockChk as any);
      const pulled = artifactRegistryProvider.pullArtifact('test-art-intg');
      assert.deepStrictEqual(pulled, mockChk as any);
    });
  });

  describe('Event System Validator', () => {
    it('should validate publishing, subscriber routing and execution ordering', async () => {
      let triggered = false;
      const unsubscribe = eventRegistry.subscribe('Validation', async (evt) => {
        triggered = true;
        assert.strictEqual(evt.eventId, 'evt-intg-1');
      });

      const event: AIIdleEvent = {
        eventId: 'evt-intg-1',
        workflowId: 'wf-intg',
        correlationId: 'corr-intg',
        timestamp: Date.now(),
        publisher: 'intg-agent',
        subscribers: [],
        priority: 'Normal',
        category: 'Validation',
        payload: { success: true },
        metadata: {},
        retryCount: 0,
        executionStatus: 'Idle'
      };

      await eventBusInstance.publish(event);
      unsubscribe();
      assert.strictEqual(triggered, true, 'Subscriber should be executed');
    });
  });

  describe('Full Pipeline Executor & Integration Coordinator', () => {
    it('should successfully run validation providers and compile platform report', async () => {
      const { report, health } = await platformValidationEngine.runAllValidations();
      
      assert.ok(report.id.startsWith('report-'));
      assert.ok(report.overallHealthScore >= 0 && report.overallHealthScore <= 100);
      assert.ok(report.scores.architecture >= 0);
      assert.ok(report.scores.integration >= 0);
      assert.ok(report.pipelineSteps.length === 13, 'Should execute all 13 stages');
      
      // Subsystem health aggregates
      assert.ok(health.subsystems.Architecture);
      assert.ok(health.subsystems.Dataset);
      assert.ok(health.subsystems.Training);
      assert.ok(health.subsystems.Runtime);
      assert.ok(health.subsystems.Events);
      
      // Verify generated report structures exist
      assert.ok(report.recommendations.length > 0);
    });
  });
});
