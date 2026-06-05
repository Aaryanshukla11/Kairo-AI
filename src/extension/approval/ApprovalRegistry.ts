import { ApprovalRequest } from '../../common/approval';

export class ApprovalRegistry {
  private static instance: ApprovalRegistry;
  private requests: Map<string, ApprovalRequest> = new Map();

  private constructor() {}

  public static getInstance(): ApprovalRegistry {
    if (!ApprovalRegistry.instance) {
      ApprovalRegistry.instance = new ApprovalRegistry();
    }
    return ApprovalRegistry.instance;
  }

  public register(request: ApprovalRequest): void {
    if (this.requests.has(request.id)) {
      throw new Error(`Approval Request with ID ${request.id} already exists.`);
    }
    this.requests.set(request.id, request);
  }

  public getRequest(id: string): ApprovalRequest | undefined {
    return this.requests.get(id);
  }

  public updateRequest(request: ApprovalRequest): void {
    if (!this.requests.has(request.id)) {
      throw new Error(`Approval Request with ID ${request.id} does not exist.`);
    }
    this.requests.set(request.id, request);
  }

  public getAllRequests(): ApprovalRequest[] {
    return Array.from(this.requests.values());
  }

  public clear(): void {
    this.requests.clear();
  }
}
