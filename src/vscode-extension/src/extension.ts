import * as vscode from 'vscode';
import {Uri, WebviewPanel} from 'vscode';
import {Utilities} from "./utilities";

const workspaceFolders = vscode.workspace.workspaceFolders;
let workspacePath: string | undefined;

export function activate(context: vscode.ExtensionContext) {
    const openWebUrlCommand = vscode.commands.registerCommand('dynamic-soft-extension.open', () => {
        const webviewPanel = createWebviewPanel(context.extensionUri);
        webviewPanel.reveal(vscode.ViewColumn.Beside);
    });

    context.subscriptions.push(openWebUrlCommand);
}

function createWebviewPanel(extensionUri: Uri): WebviewPanel {
    const panel = vscode.window.createWebviewPanel(
        'webview',
        'Dynamic Soft App',
        vscode.ViewColumn.Beside,
        {
            enableScripts: true
        }
    );

    let scriptSrc = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "dist", "static", "js", "main.js"))
    let cssSrc = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "dist", "static", "css", "main.css"))
    if (workspaceFolders) {
        workspacePath = workspaceFolders[0].uri.fsPath;
    }

    panel.webview.onDidReceiveMessage(onMessageReceivedListener);

    panel.webview.html = getHtmlContent(scriptSrc, cssSrc);
    return panel;
}

const onMessageReceivedListener = (message: any) => {
    console.log('VSCODE Received data:', message);
    if(!workspacePath) {
        console.error('No workspace opened in VS Code.');
        return;
    }

    if (message && message.type === 'createFile' && message.fileContent) {
        Utilities.createFile(message, workspacePath!);
    } else if (message && message.type === 'createProject' && message.fileContent) {
        Utilities.createProject(message, workspacePath!);
    }
}

const getHtmlContent = (scriptSrc: Uri, cssSrc: Uri) => {
    return `<!DOCTYPE html>
        <html lang="en">
          <head>
            <script defer src="${scriptSrc}"></script>
            <link rel="stylesheet" href="${cssSrc}" />
          </head>
          <body>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root"></div>
          </body>
          <script>
            window.postMessage("Init message", "*");    
            const vscode = acquireVsCodeApi();
            window.addEventListener('message', event => {
              const message = event.data;
                vscode.postMessage(message);
            });
           </script>
        </html>
        `
}

export function deactivate() {
}