export interface ILayeringStrategy {
  getLayerTargetDirectory(layer: string): string;
}

export class DecoupledLayeringStrategy implements ILayeringStrategy {
  public getLayerTargetDirectory(layer: string): string {
    switch (layer.toLowerCase()) {
      case 'frontend':
        return 'frontend/src';
      case 'backend':
        return 'backend/app';
      case 'database':
        return 'database';
      default:
        return 'shared';
    }
  }
}
