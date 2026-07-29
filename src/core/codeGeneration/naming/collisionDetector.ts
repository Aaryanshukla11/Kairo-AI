export class CollisionDetector {
  public checkCollision(name: string, namespaceFiles: string[]): boolean {
    return namespaceFiles.some(f => f.toLowerCase().includes(name.toLowerCase()));
  }
}

export const collisionDetector = new CollisionDetector();
