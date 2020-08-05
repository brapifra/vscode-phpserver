import * as vscode from 'vscode';
import CommandController from './controllers/CommandController';
import BreakingChangesNotifier from './BreakingChangesNotifier';
import { getRootPath } from './utils';

const EXTENSION_NAME = 'phpserver';

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

  const controller = new CommandController(
    getCommandControllerContext(extensionPath)
  );

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

function getCommandControllerContext(extensionPath: string) {
  return {
    extension: {
      path: extensionPath,
      getConfiguration: getExtensionConfiguration,
    },
    notify: vscode.window.showInformationMessage,
    getRootPath,
    getAbsolutePathToActiveFile: () =>
      vscode.window.activeTextEditor?.document.fileName,
  };
}

export interface ExtensionConfiguration {
  ip?: string;
  port?: number;
  relativePath?: string;
  browser?: string;
  router?: string;
  phpPath?: string;
  phpConfigPath?: string;
  autoOpenOnReload?: boolean;
}

function getExtensionConfiguration(): ExtensionConfiguration {
  const config = vscode.workspace.getConfiguration(EXTENSION_NAME);

  return {
    ip: config.get<string>('ip'),
    port: config.get<number>('port'),
    relativePath: config.get<string>('relativePath'),
    browser: config.get<string>('browser'),
    router: config.get<string>('router'),
    phpPath: config.get<string>('phpPath'),
    phpConfigPath: config.get<string>('phpConfigPath'),
    autoOpenOnReload: config.get<boolean>('autoOpenOnReload'),
  };
}

export function deactivate() {}
