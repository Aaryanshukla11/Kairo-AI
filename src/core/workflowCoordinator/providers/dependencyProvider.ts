export class DependencyProvider {
  getDependencyGraph(inputContext: any) {
    return inputContext?.dependencyGraph || { graphId: 'DG-DEFAULT', hasCycles: false };
  }
}
export const dependencyProvider = new DependencyProvider();
