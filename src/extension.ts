import * as vscode from "vscode";

import MenuProvider from "./menu-provider";

export function activate(context: vscode.ExtensionContext) {
  const provider = new MenuProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("menu", provider)
  );

  associateApollonType();
}

function associateApollonType() {
  const fileExtension = "*.apollon";
  const targetLanguage = "json";
  const filesConfig = vscode.workspace.getConfiguration("files");

  const currentAssociations: { [key: string]: string } =
    filesConfig.get("associations") || {};
  if (currentAssociations[fileExtension] !== targetLanguage) {
    filesConfig
      .update(
        "associations",
        {
          ...currentAssociations,
          [fileExtension]: targetLanguage,
        },
        vscode.ConfigurationTarget.Global
      )
      .then(
        () => {
          console.log(
            `Associated ${fileExtension} with ${targetLanguage} syntax.`
          );
        },
        (error) => {
          console.error("Error updating file associations:", error);
          vscode.window.showErrorMessage(
            `Failed to associate ${fileExtension} with ${targetLanguage} syntax.`
          );
        }
      );
  }
}

export function deactivate() {}
