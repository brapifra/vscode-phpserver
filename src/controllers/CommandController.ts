import * as vscode from 'vscode';
import Server from '../Server';

interface CommandControllerContext {
  extensionPath: string;
  getActiveFileName(): string | undefined;
}

export default class CommandController {
  private server?: Server;

  constructor(private context: CommandControllerContext) {}

  serveProject = () => {
    if (this.server && this.server.isRunning()) {
      vscode.window.showErrorMessage('Server is already running!');
      return;
    }
    this.createServer(this.context.extensionPath);
  }

  reloadServer = () => {
    const reloading = this.server && this.server.isRunning();
    if (this.server) {
      this.server.shutDown();
    }
    this.createServer(this.context.extensionPath, reloading);
  }

  openFileInBrowser = () => {
    if (!this.server || !this.server.isRunning()) {
      vscode.window.showErrorMessage('Server is not running!');
      return;
    }
    const config = vscode.workspace.getConfiguration('phpserver');

    this.server.execBrowser(
      config.get<string>('browser')!,
      this.context.getActiveFileName()
    );
  }

  stopServer = () => {
    if (this.server) {
      this.server.shutDown();
    }
  }

  private createServer = (extensionPath: string, reloading?: boolean) => {
    const config = vscode.workspace.getConfiguration('phpserver');

    const relativePath = config.get<string>('relativePath')!;
    const router = config.get<string>('router')!;
    const phpPath = config.get<string>('phpPath')!;
    const phpConfigPath = config.get<string>('phpConfigPath')!;
    const port = config.get<number>('port')!;
    const ip = config.get<string>('ip')!;

    this.server = new Server(ip, port, relativePath, extensionPath);
    this.server.setRouter(router);
    this.server.setPhpPath(phpPath);
    this.server.setPhpConfigPath(phpConfigPath);
    this.server.run();

    if (reloading && !config.get<boolean>('autoOpenOnReload')) {
      return;
    }

    this.server.execBrowser(
      config.get<string>('browser')!,
      this.context.getActiveFileName()
    );
  }
}
