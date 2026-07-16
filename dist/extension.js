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

// src/common/prompt/PromptValidator.ts
var PromptValidator = class {
  static MAX_PROMPT_LENGTH = 1e5;
  static validate(promptPayload) {
    const errors = [];
    if (!promptPayload) {
      return { valid: false, errors: ["Prompt payload is null or undefined."] };
    }
    if (typeof promptPayload.rawPrompt !== "string") {
      errors.push("rawPrompt must be a string.");
    } else {
      if (promptPayload.rawPrompt.trim().length === 0) {
        errors.push("Prompt cannot be empty or whitespace-only.");
      }
      if (promptPayload.rawPrompt.length > this.MAX_PROMPT_LENGTH) {
        errors.push(`Prompt exceeds maximum length of ${this.MAX_PROMPT_LENGTH} characters.`);
      }
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

// src/extension/pipeline/PromptPipeline.ts
var PromptPipeline = class {
  /**
   * Processes an incoming prompt through the validation and normalization layers.
   * Returns a mock successful response during the foundational phase.
   */
  async process(prompt) {
    const startTime = Date.now();
    const validation = PromptValidator.validate(prompt);
    if (!validation.valid) {
      return {
        status: "ERROR",
        accepted: false,
        promptId: prompt.id,
        processingTime: Date.now() - startTime,
        errors: validation.errors
      };
    }
    return {
      status: "SUCCESS",
      accepted: true,
      promptId: prompt.id,
      processingTime: Date.now() - startTime
    };
  }
};

// src/extension/pipeline/PromptDispatcher.ts
var PromptDispatcher = class {
  pipeline;
  constructor() {
    this.pipeline = new PromptPipeline();
  }
  /**
   * Receives incoming prompt structures from the MessageRouter and routes them
   * into the PromptPipeline asynchronously.
   */
  async dispatch(promptPayload) {
    const prompt = promptPayload;
    return await this.pipeline.process(prompt);
  }
};

// src/common/protocol/messageFactory.ts
function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
var MessageFactory = class {
  static createMessage(type, source, target, payload) {
    return {
      id: generateId(),
      type,
      timestamp: Date.now(),
      source,
      target,
      payload,
      version: "1.0.0" /* V1 */
    };
  }
  static createError(source, target, message, severity = "ERROR" /* ERROR */, stack) {
    return this.createMessage("ERROR" /* ERROR */, source, target, {
      message,
      severity,
      stack
    });
  }
  static createLog(source, target, message, data) {
    return this.createMessage("LOG" /* LOG */, source, target, {
      message,
      data
    });
  }
  static createInfo(source, target, message, data) {
    return this.createMessage("INFO" /* INFO */, source, target, {
      message,
      data
    });
  }
  static createWarning(source, target, message, data) {
    return this.createMessage("WARNING" /* WARNING */, source, target, {
      message,
      data
    });
  }
};

// src/extension/messageRouter.ts
var import_crypto = require("crypto");
var MessageRouter = class {
  constructor(webview) {
    this.webview = webview;
    this.promptDispatcher = new PromptDispatcher();
  }
  promptDispatcher;
  handleMessage(message) {
    if (!message || !message.type) {
      return;
    }
    switch (message.type) {
      case "INIT":
        this._handleInit(message);
        break;
      case "READY":
        this._handleReady(message);
        break;
      case "PING":
        this._handlePing(message);
        break;
      case "PONG":
        this._handlePong(message);
        break;
      case "ERROR":
        this._handleError(message);
        break;
      case "LOG":
        this._handleLog(message);
        break;
      case "PROMPT_REQUEST":
        this._handlePromptRequest(message);
        break;
      case "SEND_PROMPT":
        this._handleSendPrompt(message);
        break;
      default:
        console.warn(`[Sasta-Antigravity] Unhandled message type: ${message.type}`);
    }
  }
  postMessage(message) {
    message.timestamp = Date.now();
    message.source = "extension";
    this.webview.postMessage(message);
  }
  async _handlePromptRequest(message) {
    const result = await this.promptDispatcher.dispatch(message.payload);
    const responseMsg = MessageFactory.createMessage(
      "PROMPT_RESPONSE" /* PROMPT_RESPONSE */,
      "EXTENSION" /* EXTENSION */,
      "WEBVIEW" /* WEBVIEW */,
      result
    );
    this.postMessage(responseMsg);
  }
  _handleSendPrompt(message) {
    const receivedMsg = MessageFactory.createMessage(
      "PROMPT_RECEIVED" /* PROMPT_RECEIVED */,
      "EXTENSION" /* EXTENSION */,
      "WEBVIEW" /* WEBVIEW */,
      { promptId: message.payload?.id }
    );
    this.postMessage(receivedMsg);
    setTimeout(() => {
      const responseMsg = MessageFactory.createMessage(
        "MOCK_RESPONSE" /* MOCK_RESPONSE */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        {
          id: (0, import_crypto.randomUUID)(),
          role: "ASSISTANT",
          content: "AIIdle received your prompt successfully.\n\nPlanner has not been connected yet.\n\nThis is a mock response from the Extension Host.",
          timestamp: Date.now(),
          status: "SUCCESS"
        }
      );
      this.postMessage(responseMsg);
    }, 400);
  }
  _handleInit(message) {
    this.postMessage({ type: "READY" });
  }
  _handleReady(message) {
  }
  _handlePing(message) {
    this.postMessage({ type: "PONG", payload: message.payload });
  }
  _handlePong(message) {
  }
  _handleError(message) {
    console.error(`[Sasta-Antigravity] Webview Error:`, message.payload);
  }
  _handleLog(message) {
    console.log(`[Sasta-Antigravity] Webview Log:`, message.payload);
  }
};

// src/extension/webviewProvider.ts
var SastaAntigravityWebviewProvider = class {
  constructor(_extensionUri) {
    this._extensionUri = _extensionUri;
  }
  static viewType = "sasta-antigravity.chatView";
  _view;
  _disposables = [];
  _messageRouter;
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
   * Centralized message router dispatching actions.
   */
  _handleWebviewMessage(message) {
    if (!this._messageRouter) {
      this._messageRouter = new MessageRouter(this._view.webview);
    }
    this._messageRouter.handleMessage(message);
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
