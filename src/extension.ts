import * as vscode from 'vscode';
import CommandController from './controllers/CommandController';
import BreakingChangesNotifier from './BreakingChangesNotifier';
import { getRootPath, withErrorHandler } from './utils';
import OllamaClient from './OllamaClient';
import JsonSettingsServer from './server/JsonSettingsServer';

const EXTENSION_NAME = 'phpserver';

type ExtensionContext = Pick<
  vscode.ExtensionContext,
  'subscriptions' | 'extensionPath' | 'globalState'
>;

const ErrorHandler = withErrorHandler((error) => {
  vscode.window.showErrorMessage(error.message);
});

export async function activate({
  subscriptions,
  extensionPath,
  globalState,
}: ExtensionContext) {
  new BreakingChangesNotifier(globalState).notifyIfRequired();

  const configuration = vscode.workspace.getConfiguration(EXTENSION_NAME);
  const jsonSettingsServer = new JsonSettingsServer(
    globalState,
    configuration.get<string>('jsonApiHost', '127.0.0.1'),
    configuration.get<number>('jsonApiPort', 3888),
    (error) => vscode.window.showErrorMessage(error.message)
  );
  subscriptions.push(jsonSettingsServer);
  jsonSettingsServer.start().catch((error: Error) => {
    vscode.window.showErrorMessage(
      `JSON settings API could not start: ${error.message}`
    );
  });

  const controller = new CommandController(
    getCommandControllerContext(extensionPath)
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      'extension.phpServer.serveProject',
      ErrorHandler(controller.serveProject)
    )
  );
  subscriptions.push(
    vscode.commands.registerCommand(
      'extension.phpServer.reloadServer',
      ErrorHandler(controller.reloadServer)
    )
  );
  subscriptions.push(
    vscode.commands.registerCommand(
      'extension.phpServer.openFileInBrowser',
      ErrorHandler(controller.openFileInBrowser)
    )
  );
  subscriptions.push(
    vscode.commands.registerCommand(
      'extension.phpServer.stopServer',
      ErrorHandler(controller.stopServer)
    )
  );
  subscriptions.push(
    vscode.commands.registerCommand(
      'extension.phpServer.installRemoteTunnelService',
      () => runRemoteTunnelServiceCommand('install')
    )
  );
  subscriptions.push(
    vscode.commands.registerCommand(
      'extension.phpServer.uninstallRemoteTunnelService',
      () => runRemoteTunnelServiceCommand('uninstall')
    )
  );
  subscriptions.push(
    vscode.commands.registerCommand('extension.phpServer.askOllama', () => {
      askOllama().catch((error) => {
        const message =
          error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(message);
      });
    })
  );
}

function runRemoteTunnelServiceCommand(action: 'install' | 'uninstall') {
  const terminal = vscode.window.createTerminal('Remote Tunnel Service');
  terminal.show();
  terminal.sendText(`code tunnel service ${action}`);
}

async function askOllama() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    throw new Error('Open a file or select code before asking Ollama');
  }

  const prompt = await vscode.window.showInputBox({
    prompt: 'What would you like Ollama to do with the selected code or file?',
    placeHolder: 'Explain this code, find a bug, suggest a refactor...',
    ignoreFocusOut: true,
  });
  if (!prompt) {
    return;
  }

  const selection = editor.document.getText(editor.selection);
  const context = selection || editor.document.getText();
  const configuration = vscode.workspace.getConfiguration(EXTENSION_NAME);
  const host = configuration.get<string>(
    'ollamaHost',
    'http://localhost:11434'
  );
  const model = configuration.get<string>(
    'ollamaModel',
    'qwen3-coder:30b'
  );
  const language = editor.document.languageId;
  const response = await new OllamaClient(host, model).chat(
    `${prompt}\n\nContext (${language}):\n\`\`\`${language}\n${context}\n\`\`\``
  );

  const document = await vscode.workspace.openTextDocument({
    language: 'markdown',
    content: `# Ollama response (${model})\n\n${response}`,
  });
  await vscode.window.showTextDocument(document, { preview: false });
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
