import * as vscode from "vscode";
import { MessageRouter } from "./messageRouter";

/**
 * Valid commands dispatchable by the webview client.
 */
export type WebviewCommand =
  | "SEND_PROMPT"
  | "OPEN_SETTINGS"
  | "STOP_EXECUTION"
  | "REQUEST_CONTEXT"
  | "EXECUTE_PLAN";

/**
 * Provider class managing the lifecycle, HTML rendering, and message channels
 * for the Sasta-Antigravity Sidebar Webview.
 */
export class SastaAntigravityWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "sasta-antigravity.chatView";
  private _view?: vscode.WebviewView;
  private _disposables: vscode.Disposable[] = [];
  private _messageRouter?: MessageRouter;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  /**
   * Invoked by VS Code when the webview view is first instantiated.
   */
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this._view = webviewView;

    // 1. Configure secure webview options
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    // 2. Load the initial HTML content
    webviewView.webview.html = this.renderHtml(webviewView.webview);

    // 3. Initialize message channel listener
    const messageDisposable = webviewView.webview.onDidReceiveMessage((message) => {
      this._handleWebviewMessage(message);
    });
    this._disposables.push(messageDisposable);

    // 4. Register disposal hooks to prevent memory leaks
    webviewView.onDidDispose(() => {
      this.dispose();
    });
  }

  /**
   * Cleans up disposables and clears active references when the view is closed.
   */
  public dispose(): void {
    this._disposables.forEach((disposable) => disposable.dispose());
    this._disposables = [];
    this._view = undefined;
  }

  /**
   * Generates the secure HTML template containing the Content Security Policy (CSP).
   * Declared as public/private according to architectural rules.
   */
  private renderHtml(webview: vscode.Webview): string {
    const nonce = this._getNonce();

    // Resolve local resource paths
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "webview", "main.js")
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "webview", "main.css")
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${webview.cspSource}; img-src ${webview.cspSource} https:; font-src ${webview.cspSource};">
  <link rel="stylesheet" href="${styleUri}">
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  /**
   * Centralized message router dispatching actions.
   */
  private _handleWebviewMessage(message: any): void {
    if (!this._messageRouter) {
      this._messageRouter = new MessageRouter(this._view!.webview);
    }
    this._messageRouter.handleMessage(message);
  }

  /**
   * Helper function creating random nonces to secure script executions.
   */
  private _getNonce(): string {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
