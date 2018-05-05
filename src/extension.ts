import * as vscode from 'vscode';
import Server from './Server';
let server: Server;

export function activate(context: vscode.ExtensionContext) {
  const subscriptions = context.subscriptions as any;

  subscriptions.push(
    vscode.commands.registerCommand("extension.serveProject", function () {
      if (server && server.isRunning()) {
        vscode.window.showErrorMessage("Server is already running!");
        return;
      }
      createServer(context.extensionPath);
    })
  );
  subscriptions.push(
    vscode.commands.registerCommand("extension.reloadServer", function () {
      if (server) {
        server.shutDown();
      }
      createServer(context.extensionPath);
    })
  );
  subscriptions.push(
    vscode.commands.registerCommand("extension.stopServer", deactivate)
  );
}

export function deactivate() {
  if (server) {
    server.shutDown();
  }
}

function createServer(extensionPath: string) {
  const config = vscode.workspace.getConfiguration("phpserver");
  const relativePath = config.get<string>("relativePath");
  const router = config.get<string>("router");
  const phpPath = config.get<string>("phpPath");
  const port = config.get<number>("port");
  const ip = config.get<string>("ip");

  server = new Server(ip, port, relativePath, extensionPath);
  server.setRouter(router);
  server.setPhpPath(phpPath);
  server.execBrowser(config.get<string>('browser'),
    vscode.window.activeTextEditor ?
      vscode.window.activeTextEditor.document.fileName : null);
}
