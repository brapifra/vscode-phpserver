import * as vscode from 'vscode';
import CommandController from './controllers/CommandController';

export function activate(context: vscode.ExtensionContext) {
  const subscriptions = context.subscriptions as any;
  const controller = new CommandController({
    extensionPath: context.extensionPath,
    getActiveFileName: () => vscode.window.activeTextEditor?.document.fileName,
  });

  subscriptions.push(
    vscode.commands.registerCommand(
      'extension.phpServer.serveProject',
      controller.serveProject
    )
  );
  subscriptions.push(
    vscode.commands.registerCommand(
      'extension.phpServer.reloadServer',
      controller.reloadServer
    )
  );
  subscriptions.push(
    vscode.commands.registerCommand(
      'extension.phpServer.openFileInBrowser',
      controller.openFileInBrowser
    )
  );
  subscriptions.push(
    vscode.commands.registerCommand(
      'extension.phpServer.stopServer',
      controller.stopServer
    )
  );
}

export function deactivate() {}
