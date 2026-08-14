import * as fs from 'fs';
import * as path from 'path';
import { PermissionRequest, PermissionStatus } from './permissionTypes';

export class PermissionRegistry {
  private requests = new Map<string, PermissionRequest>();
  private auditLogPath: string;

  constructor(workspaceRoot: string) {
    const hasWorkspaceAiidle = fs.existsSync(path.resolve(workspaceRoot, '.aiidle'));
    const logDir = hasWorkspaceAiidle
      ? path.resolve(workspaceRoot, '.aiidle', 'logs')
      : path.resolve(require('os').tmpdir(), 'kairo-logs', path.basename(workspaceRoot));

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    this.auditLogPath = path.join(logDir, 'permission-audit.log');
  }

  /**
   * Registers a permission request and appends logs to permission-audit.log.
   */
  public register(request: PermissionRequest): void {
    if (this.requests.has(request.id)) {
      throw new Error(`Permission validation error: Duplicate request detected: "${request.id}"`);
    }
    this.requests.set(request.id, request);
    this.writeAudit(request, 'Requested');
  }

  public getById(id: string): PermissionRequest | undefined {
    return this.requests.get(id);
  }

  public getHistory(): PermissionRequest[] {
    return Array.from(this.requests.values());
  }

  /**
   * Updates state parameters and logs audits.
   */
  public updateStatus(id: string, status: PermissionStatus): void {
    const req = this.requests.get(id);
    if (req) {
      req.status = status;
      this.writeAudit(req, `Status updated to ${status}`);
    }
  }

  private writeAudit(req: PermissionRequest, eventDesc: string): void {
    const line = `[${new Date().toISOString()}] [${req.action}] [${req.riskLevel}] Resource: ${req.resource} | By: ${req.requestedBy} | Event: ${eventDesc} (ID: ${req.id})\n`;
    try {
      fs.appendFileSync(this.auditLogPath, line, 'utf8');
    } catch {
      // Fallback
    }
  }

  public getAuditLogPath(): string {
    return this.auditLogPath;
  }
}
