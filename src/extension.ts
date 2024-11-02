import * as vscode from "vscode";

import MenuProvider from "./menu-provider";

export function activate(context: vscode.ExtensionContext) {
  const provider = new MenuProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("menu", provider)
  );
}

export function deactivate() {}
