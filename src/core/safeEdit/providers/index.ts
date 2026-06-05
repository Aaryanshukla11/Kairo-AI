import { SafetyProvider } from './baseSafetyProvider';
import { filesystemProvider } from './filesystemProvider';
import { gitProvider } from './gitProvider';
import { terminalProvider } from './terminalProvider';
import { dockerProvider } from './dockerProvider';
import { databaseProvider } from './databaseProvider';
import { networkProvider } from './networkProvider';
import { secretProvider } from './secretProvider';
import { cloudProvider } from './cloudProvider';

export class SafetyProviderRegistry {
  private providers = new Map<string, SafetyProvider>();

  constructor() {
    this.register(filesystemProvider);
    this.register(gitProvider);
    this.register(terminalProvider);
    this.register(dockerProvider);
    this.register(databaseProvider);
    this.register(networkProvider);
    this.register(secretProvider);
    this.register(cloudProvider);
  }

  public register(provider: SafetyProvider): void {
    this.providers.set(provider.name, provider);
  }

  public list(): SafetyProvider[] {
    return Array.from(this.providers.values());
  }

  public get(name: string): SafetyProvider | undefined {
    return this.providers.get(name);
  }
}

export const safetyProviderRegistry = new SafetyProviderRegistry();
export * from './baseSafetyProvider';
export * from './filesystemProvider';
export * from './gitProvider';
export * from './terminalProvider';
export * from './dockerProvider';
export * from './databaseProvider';
export * from './networkProvider';
export * from './secretProvider';
export * from './cloudProvider';
