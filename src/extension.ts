import * as vscode from 'vscode';
import CommandController from './controllers/CommandController';
import BreakingChangesNotifier from './BreakingChangesNotifier';

type ExtensionContext = Pick<
  vscode.ExtensionContext,
  'subscriptions' | 'extensionPath' | 'globalState'
>;

export async function activate({
  subscriptions,
  extensionPath,
  globalState,
}: ExtensionContext) {
  new BreakingChangesNotifier(globalState).notifyIfRequired();

  const controller = new CommandController({
    extensionPath,
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
