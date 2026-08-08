import * as vscode from "vscode";
import { SastaAntigravityWebviewProvider } from "./webviewProvider";

process.noDeprecation = true;
import { workspaceLifecycleManager } from "../core/workspace/workspaceLifecycleManager";

// VS Code Extension Output Channel for system diagnostics
let outputChannel: vscode.OutputChannel | undefined;

/**
 * Activates the Sasta-Antigravity VS Code extension.
 * @param context The VS Code extension context.
 */
export function activate(context: vscode.ExtensionContext): void {
  try {
    // 0. Setup Workspace Lifecycle Listener
    workspaceLifecycleManager.setupWorkspaceListeners(context);

    // 1. Initialize output channel for startup logging
    outputChannel = vscode.window.createOutputChannel("Sasta-Antigravity");
    outputChannel.appendLine("[Sasta-Antigravity] Extension activation initiated.");

    // 2. Register standard activation command
    const startSessionCommand = vscode.commands.registerCommand(
      "sasta-antigravity.startSession",
      () => {
        try {
          vscode.window.showInformationMessage("Sasta-Antigravity initialized successfully.");

          if (outputChannel) {
            outputChannel.appendLine("[Sasta-Antigravity] Command 'sasta-antigravity.startSession' executed successfully.");
          }
        } catch (commandError) {
          vscode.window.showErrorMessage("Sasta-Antigravity encountered an error while starting session.");
          if (outputChannel) {
            outputChannel.appendLine(`[Sasta-Antigravity] Command execution error: ${commandError}`);
          }
        }
      }
    );

    context.subscriptions.push(startSessionCommand);

    // Register all Kairo AI commands
    const commandList = [
      { id: "kairo.newProject", msg: "Kairo AI: New Project initialized." },
      { id: "kairo.generate", msg: "Kairo AI: Generation pipeline triggered." },
      { id: "kairo.stop", msg: "Kairo AI: Current pipeline stopped." },
      { id: "kairo.retry", msg: "Kairo AI: Pipeline retry initiated." },
      { id: "kairo.clearHistory", msg: "Kairo AI: Session history cleared." },
      { id: "kairo.showLogs", msg: "Kairo AI: Opening output logs..." }
    ];

    for (const cmd of commandList) {
      const reg = vscode.commands.registerCommand(cmd.id, () => {
        if (cmd.id === "kairo.showLogs" && outputChannel) {
          outputChannel.show();
        }
        vscode.window.showInformationMessage(cmd.msg);
        outputChannel?.appendLine(`[Sasta-Antigravity] Command '${cmd.id}' executed.`);
      });
      context.subscriptions.push(reg);
    }

    // 3. Register Sidebar Webview Provider
    const webviewProvider = new SastaAntigravityWebviewProvider(context.extensionUri);
    const webviewRegister = vscode.window.registerWebviewViewProvider(
      SastaAntigravityWebviewProvider.viewType,
      webviewProvider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      }
    );
    context.subscriptions.push(webviewRegister);

    outputChannel.appendLine("[Sasta-Antigravity] Extension activation completed successfully.");
  } catch (activationError) {
    vscode.window.showErrorMessage("Failed to activate Sasta-Antigravity extension.");
    if (outputChannel) {
      outputChannel.appendLine(`[Sasta-Antigravity] Activation failed: ${activationError}`);
    }
  }
}

/**
 * Deactivates the Sasta-Antigravity VS Code extension.
 */
export function deactivate(): void {
  if (outputChannel) {
    outputChannel.appendLine("[Sasta-Antigravity] Extension deactivation initiated.");
    outputChannel.dispose();
    outputChannel = undefined;
  }
}
