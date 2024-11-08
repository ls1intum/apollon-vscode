import * as vscode from "vscode";
import * as fs from "fs";
import fg from "fast-glob";
import { defaultDiagram } from "./types";
import path from "path";
import { UMLModel } from "@ls1intum/apollon";

// TODO: Add logic for diagram type

export default class MenuProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private editorPanel?: vscode.WebviewPanel;
  private loadedDiagramPath?: string;
  private modelToLoad?: UMLModel;

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

    webviewView.webview.html = this._getHtmlForMenu(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
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
          this.loadDiagram(name);
          this.loadedDiagramPath = filePath;

          break;
        }
        case "loadDiagram": {
          const rootUri = vscode.workspace.workspaceFolders?.[0].uri;

          if (!rootUri) {
            vscode.window.showErrorMessage("No workspace folder open");
            return;
          }

          const relativeDiagramPath: string = data.path;
          const fullDiagramPath = path.join(
            rootUri.fsPath,
            relativeDiagramPath
          );
          const diagramName = relativeDiagramPath.substring(
            relativeDiagramPath.lastIndexOf("/") + 1
          );

          try {
            if (fs.existsSync(fullDiagramPath)) {
              const content = await vscode.workspace.fs.readFile(
                vscode.Uri.file(fullDiagramPath)
              );
              const contentString = new TextDecoder("utf-8").decode(content);
              const contentJson = JSON.parse(contentString);

              this.loadDiagram(diagramName, contentJson.model);
              this.loadedDiagramPath = fullDiagramPath;
            } else {
              vscode.window.showErrorMessage("Diagram file not found");
            }
          } catch (error) {
            vscode.window.showErrorMessage(
              `An unexpected error occured: "${error}"`
            );
          }

          break;
        }
      }
    });
  }

  private loadDiagram(name: string, model?: UMLModel) {
    if (this.editorPanel) {
      this.editorPanel.webview.postMessage({
        command: "loadDiagram",
        model: model ? JSON.stringify(model) : undefined,
      });
      this.editorPanel.title = name;
      this.editorPanel.reveal(vscode.ViewColumn.One);
    } else {
      this.editorPanel = vscode.window.createWebviewPanel(
        "editor",
        name,
        vscode.ViewColumn.One,
        { enableScripts: true, retainContextWhenHidden: true }
      );
      this.editorPanel.webview.onDidReceiveMessage(async (data) => {
        switch (data.type) {
          case "editorMounted": {
            if (this.editorPanel && this.modelToLoad) {
              this.editorPanel.webview.postMessage({
                command: "loadDiagram",
                model: JSON.stringify(this.modelToLoad),
              });
              this.modelToLoad = undefined;
            }

            break;
          }
          case "saveDiagram": {
            const rootUri = vscode.workspace.workspaceFolders?.[0].uri;

            if (!rootUri) {
              vscode.window.showErrorMessage("No workspace folder open");
              return;
            }

            if (!this.loadedDiagramPath) {
              vscode.window.showErrorMessage("An unexpected error occured");
              return;
            }

            try {
              if (fs.existsSync(this.loadedDiagramPath)) {
                const content = await vscode.workspace.fs.readFile(
                  vscode.Uri.file(this.loadedDiagramPath)
                );
                const contentString = new TextDecoder("utf-8").decode(content);
                const contentJson = JSON.parse(contentString);
                contentJson.model = data.model;

                await vscode.workspace.fs.writeFile(
                  vscode.Uri.file(this.loadedDiagramPath),
                  Buffer.from(JSON.stringify(contentJson), "utf8")
                );
                vscode.window.showInformationMessage(
                  `Successfuly saved diagram ${name}`
                );
              } else {
                vscode.window.showErrorMessage("Diagram file not found");
              }
            } catch (error) {
              vscode.window.showErrorMessage(
                `An unexpected error occured: "${error}"`
              );
            }

            break;
          }
          case "exportDiagram": {
            if (!this.loadedDiagramPath) {
              vscode.window.showErrorMessage("An unexpected error occured");
              return;
            }

            const exportPath = vscode.Uri.file(
              this.loadedDiagramPath.substring(
                0,
                this.loadedDiagramPath.lastIndexOf(".") + 1
              ) + data.exportType
            );
            const exportContentBuffer = Buffer.from(data.exportContent, "utf8");

            try {
              await vscode.workspace.fs.writeFile(
                exportPath,
                exportContentBuffer
              );
              vscode.window.showInformationMessage(
                `Successfuly exported diagram ${name}`
              );
            } catch (error) {
              vscode.window.showErrorMessage(
                `An unexpected error occured: "${error}"`
              );
            }

            break;
          }
        }
      });
      this.editorPanel.webview.html = this._getHtmlForEditor(
        this.editorPanel.webview
      );
      this.modelToLoad = model;
      this.editorPanel.onDidDispose(() => {
        this.editorPanel = undefined;
        this.loadedDiagramPath = undefined;
      });
    }
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

  private _getHtmlForMenu(webview: vscode.Webview) {
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

  private _getHtmlForEditor(webview: vscode.Webview) {
    const scriptSrc = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "editor", "dist", "index.js")
    );
    const cssSrc = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "editor", "dist", "index.css")
    );

    return `<!DOCTYPE html>
          <html lang="en">
            <head>
              <link rel="stylesheet" href="${cssSrc}" />
            </head>
            <body>
              <noscript>You need to enable JavaScript to run this app.</noscript>
              <div id="editor-root"></div>
              <script src="${scriptSrc}"></script>
            </body>
          </html>
          `;
  }
}
