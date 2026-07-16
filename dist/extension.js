"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension/index.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode2 = __toESM(require("vscode"));

// src/extension/webviewProvider.ts
var vscode = __toESM(require("vscode"));
var SastaAntigravityWebviewProvider = class {
  constructor(_extensionUri) {
    this._extensionUri = _extensionUri;
  }
  static viewType = "sasta-antigravity.chatView";
  _view;
  _disposables = [];
  /**
   * Invoked by VS Code when the webview view is first instantiated.
   */
  resolveWebviewView(webviewView, _context, _token) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };
    webviewView.webview.html = this.renderHtml(webviewView.webview);
    const messageDisposable = webviewView.webview.onDidReceiveMessage((message) => {
      this._handleWebviewMessage(message);
    });
    this._disposables.push(messageDisposable);
    webviewView.onDidDispose(() => {
      this.dispose();
    });
  }
  /**
   * Cleans up disposables and clears active references when the view is closed.
   */
  dispose() {
    this._disposables.forEach((disposable) => disposable.dispose());
    this._disposables = [];
    this._view = void 0;
  }
  /**
   * Generates the secure HTML template containing the Content Security Policy (CSP).
   * Declared as public/private according to architectural rules.
   */
  renderHtml(webview) {
    const nonce = this._getNonce();
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
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <link rel="stylesheet" href="${styleUri}">
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
  /**
   * Centralized message router dispatching actions to individual stub handlers.
   */
  _handleWebviewMessage(message) {
    switch (message.command) {
      case "SEND_PROMPT":
        this._handleSendPrompt(message.data);
        break;
      case "OPEN_SETTINGS":
        this._handleOpenSettings(message.data);
        break;
      case "STOP_EXECUTION":
        this._handleStopExecution();
        break;
      case "REQUEST_CONTEXT":
        this._handleRequestContext();
        break;
      case "EXECUTE_PLAN":
        this._handleExecutePlan(message.data);
        break;
      default:
        console.warn(`[Sasta-Antigravity] Unrecognized webview command received: ${message.command}`);
        break;
    }
  }
  /**
   * Action stubs reserved for future logic tasks.
   */
  _handleSendPrompt(data) {
  }
  _handleOpenSettings(data) {
  }
  _handleStopExecution() {
  }
  _handleRequestContext() {
  }
  _handleExecutePlan(data) {
  }
  /**
   * Helper function creating random nonces to secure script executions.
   */
  _getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
};

// src/extension/index.ts
var outputChannel;
function activate(context) {
  try {
    outputChannel = vscode2.window.createOutputChannel("Sasta-Antigravity");
    outputChannel.appendLine("[Sasta-Antigravity] Extension activation initiated.");
    const startSessionCommand = vscode2.commands.registerCommand(
      "sasta-antigravity.startSession",
      () => {
        try {
          vscode2.window.showInformationMessage("Sasta-Antigravity initialized successfully.");
          if (outputChannel) {
            outputChannel.appendLine("[Sasta-Antigravity] Command 'sasta-antigravity.startSession' executed successfully.");
          }
        } catch (commandError) {
          vscode2.window.showErrorMessage("Sasta-Antigravity encountered an error while starting session.");
          if (outputChannel) {
            outputChannel.appendLine(`[Sasta-Antigravity] Command execution error: ${commandError}`);
          }
        }
      }
    );
    context.subscriptions.push(startSessionCommand);
    const webviewProvider = new SastaAntigravityWebviewProvider(context.extensionUri);
    const webviewRegister = vscode2.window.registerWebviewViewProvider(
      SastaAntigravityWebviewProvider.viewType,
      webviewProvider
    );
    context.subscriptions.push(webviewRegister);
    outputChannel.appendLine("[Sasta-Antigravity] Extension activation completed successfully.");
  } catch (activationError) {
    vscode2.window.showErrorMessage("Failed to activate Sasta-Antigravity extension.");
    if (outputChannel) {
      outputChannel.appendLine(`[Sasta-Antigravity] Activation failed: ${activationError}`);
    }
  }
}
function deactivate() {
  if (outputChannel) {
    outputChannel.appendLine("[Sasta-Antigravity] Extension deactivation initiated.");
    outputChannel.dispose();
    outputChannel = void 0;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
