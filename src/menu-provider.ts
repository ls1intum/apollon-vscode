import * as vscode from "vscode";
import fg from "fast-glob";
import { defaultDiagram } from "./types";
import path from "path";

export default class MenuProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      // TODO: Implement logic for messages from the menu
      // - Load existing diagram
      // TODO: Implement logic for messages from editor
      // - Save diagram
      // - Export diagram

      switch (data.type) {
        case "fetchDiagrams": {
          const rootUri = vscode.workspace.workspaceFolders?.[0].uri;

          if (!rootUri) {
            return;
          }

          const diagrams = await this.fetchDiagrams(rootUri);

          await webviewView.webview.postMessage({
            command: "updateDiagrams",
            diagrams: diagrams,
          });

          break;
        }
        case "createDiagram": {
          const rootUri = vscode.workspace.workspaceFolders?.[0].uri;

          if (!rootUri) {
            vscode.window.showErrorMessage("No workspace folder open");
            return;
          }

          const name = `${data.name}.apollon`;
          const diagram = JSON.stringify(defaultDiagram);
          const filePath = path.join(rootUri.fsPath, name);

          try {
            await vscode.workspace.fs.writeFile(
              vscode.Uri.file(filePath),
              Buffer.from(diagram, "utf8")
            );
            vscode.window.showInformationMessage(
              `Successfuly created diagram ${name}`
            );
          } catch (error) {
            vscode.window.showErrorMessage(`Error creating diagram: ${error}`);
          }

          const diagrams = await this.fetchDiagrams(rootUri);

          await webviewView.webview.postMessage({
            command: "updateDiagrams",
            diagrams: diagrams,
          });

          // TODO: Post message to editor to open diagram

          break;
        }
        case "loadDiagram": {
          // TODO: Find diagram with proper error handling

          // TOOD: Post message to editor to open diagram

          break;
        }
      }
    });
  }

  private async fetchDiagrams(rootUri: vscode.Uri) {
    const diagrams = await fg(rootUri.path + "/**/*.apollon", {
      ignore: [
        `!${rootUri.path}/.git`,
        `!${rootUri.path}/.vscode`,
        `!${rootUri.path}/**/node_modules`,
      ],
    });

    return diagrams.map((file) => `.${file.split(rootUri.path)[1]}`);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptSrc = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "menu", "dist", "index.js")
    );
    const cssSrc = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "menu", "dist", "index.css")
    );

    return `<!DOCTYPE html>
          <html lang="en">
            <head>
              <link rel="stylesheet" href="${cssSrc}" />
            </head>
            <body>
              <noscript>You need to enable JavaScript to run this app.</noscript>
              <div id="menu-root"></div>
              <script src="${scriptSrc}"></script>
            </body>
          </html>
          `;
  }
}
