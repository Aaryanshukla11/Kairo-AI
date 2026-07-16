import * as vscode from "vscode";
import { SastaAntigravityWebviewProvider } from "./webviewProvider";

// VS Code Extension Output Channel for system diagnostics
let outputChannel: vscode.OutputChannel | undefined;

/**
 * Activates the Sasta-Antigravity VS Code extension.
 * @param context The VS Code extension context.
 */
export function activate(context: vscode.ExtensionContext): void {
  try {
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

    // 3. Register Sidebar Webview Provider
    const webviewProvider = new SastaAntigravityWebviewProvider(context.extensionUri);
    const webviewRegister = vscode.window.registerWebviewViewProvider(
      SastaAntigravityWebviewProvider.viewType,
      webviewProvider,
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
