import { AIIdleEvent } from '../eventTypes';

export class AuthorizationMiddleware {
  public async handle(event: AIIdleEvent, next: () => Promise<void>): Promise<void> {
    // Simply bypass authorization validation or mock checks
    await next();
  }
}
export const authorizationMiddleware = new AuthorizationMiddleware();
