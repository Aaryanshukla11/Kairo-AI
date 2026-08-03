import React from 'react';
import { WorkspaceSummaryCard } from '../ui/WorkspaceSummaryCard';
import { GitSummary } from '../git/GitSummary';
import { PatchPreview } from '../patch/PatchPreview';
import { RollbackPanel } from '../rollback/RollbackPanel';
import { CheckpointPanel } from '../checkpoint/CheckpointPanel';
import { DiagnosticsPanel } from '../diagnostics/DiagnosticsPanel';
import { PermissionCenter } from '../permission/PermissionCenter';
import { ContextInspector } from '../context/ContextInspector';
import { ProjectExplorer } from '../indexer/ProjectExplorer';
import { EmbeddingStatusPanel } from '../embedding/EmbeddingStatusPanel';
import { VectorStorePanel } from '../vectorStore/VectorStorePanel';
import { RetrievalInspector } from '../retriever/RetrievalInspector';
import { PromptInspector } from '../promptAssembly/PromptInspector';
import { RuntimeMonitor } from '../runtime/RuntimeMonitor';
import { ToolCenter } from '../toolCalling/ToolCenter';
import { AgentMonitor } from '../agents/AgentMonitor';
import { PlannerInspector } from '../agents/planner/PlannerInspector';
import { ReviewCenter } from '../agents/reviewer/ReviewCenter';
import { ExecutionMonitor } from '../agents/executor/ExecutionMonitor';
import { MemoryCenter } from '../agents/memory/MemoryCenter';
import { TestingDashboard } from '../agents/testing/TestingDashboard';
import { SecurityCenter } from '../agents/security/SecurityCenter';
import { DocumentationCenter } from '../agents/documentation/DocumentationCenter';
import { RefactoringCenter } from '../agents/refactoring/RefactoringCenter';
import { DebugCenter } from '../agents/debug/DebugCenter';
import { PerformanceCenter } from '../agents/performance/PerformanceCenter';
import { DependencyCenter } from '../agents/dependency/DependencyCenter';
import { ArchitectureCenter } from '../agents/architecture/ArchitectureCenter';
import { GenerationCenter } from './GenerationCenter';
import { ASTInspector } from './ASTInspector';
import { MultiFileGenerationCenter } from './MultiFileGenerationCenter';
import { IncrementalEditCenter } from './IncrementalEditCenter';
import { ConventionCenter } from './ConventionCenter';
import { NamingCenter } from './NamingCenter';
import { ImportResolutionCenter } from './ImportResolutionCenter';
import { SymbolResolutionCenter } from './SymbolResolutionCenter';
import { SelfReviewCenter } from './SelfReviewCenter';
import { ValidationCenter } from './ValidationCenter';
import { PatchOptimizationCenter } from './PatchOptimizationCenter';
import { SafeEditCenter } from './SafeEditCenter';
import { EventBusDashboard } from './EventBusDashboard';
import { TaskPlannerDashboard } from './TaskPlannerDashboard';
import { ExecutionPlannerDashboard } from './ExecutionPlannerDashboard';
import { MilestoneDashboard } from './MilestoneDashboard';
import { WorkflowDashboard } from './WorkflowDashboard';
import { ReplanningDashboard } from './ReplanningDashboard';
import { RecoveryDashboard } from './RecoveryDashboard';

export function EmptyState(): React.JSX.Element {
  return (
    <div className="chat-empty-state" style={{ textAlign: 'center', width: '100%' }}>
      <h2 className="chat-empty-title display">How can I help you?</h2>
      <WorkspaceSummaryCard />
      <GitSummary />
      <PatchPreview />
      <RollbackPanel />
      <CheckpointPanel />
      <DiagnosticsPanel />
      <PermissionCenter />
      <ContextInspector />
      <ProjectExplorer />
      <EmbeddingStatusPanel />
      <VectorStorePanel />
      <RetrievalInspector />
      <PromptInspector />
      <RuntimeMonitor />
      <ToolCenter />
      <AgentMonitor />
      <PlannerInspector />
      <ReviewCenter />
      <ExecutionMonitor />
      <MemoryCenter />
      <TestingDashboard />
      <SecurityCenter />
      <DocumentationCenter />
      <RefactoringCenter />
      <DebugCenter />
      <PerformanceCenter />
      <DependencyCenter />
      <ArchitectureCenter />
      <GenerationCenter />
      <ASTInspector />
      <MultiFileGenerationCenter />
      <IncrementalEditCenter />
      <ConventionCenter />
      <NamingCenter />
      <ImportResolutionCenter />
      <SymbolResolutionCenter />
      <SelfReviewCenter />
      <ValidationCenter />
      <PatchOptimizationCenter />
      <SafeEditCenter />
      <EventBusDashboard />
      <TaskPlannerDashboard />
      <ExecutionPlannerDashboard />
      <MilestoneDashboard />
      <WorkflowDashboard />
      <ReplanningDashboard />
      <RecoveryDashboard />
    </div>
  );
}
