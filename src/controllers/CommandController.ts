import PHPServer, { PHPServerConfig } from '../server/PHPServer';
import { ExtensionConfiguration } from '../extension';
import { platform } from 'os';
import { relative } from 'path';
import { AnyBrowser } from '../browser/Browser';
import Messages from '../Messages';
import VSCodeLogger, { Logger } from '../VSCodeLogger';

interface CommandControllerContext {
  extension: {
    path: string;
    getConfiguration(): ExtensionConfiguration;
  };
  notify(message: string): void;
  getRootPath(): string | undefined;
  getAbsolutePathToActiveFile(): string | undefined;
}

export default class CommandController {
  private server: PHPServer;
  private logger: Logger = new VSCodeLogger('PHP Server');

  constructor(private context: CommandControllerContext) {
    this.server = new PHPServer();

    this.server.on('data', this.logger.appendLine);

    this.server.on('close', () => {
      this.context.notify(Messages.SERVER_STOPPED);
    });

    this.server.on('error', (errorMessage) => {
      this.logger.show();
      this.logger.appendLine(errorMessage);
      this.server.stop();
    });
  }

  serveProject = (): void => {
    if (this.server.isRunning()) {
      throw Error(Messages.SERVER_IS_ALREADY_RUNNING);
    }

    this.logger.clear();
    this.logger.show();

    this.startServer();
    this.openBrowserIfPossible();
  };

  reloadServer = (): void => {
    if (this.server.isRunning()) {
      this.server.stop();
    }

    this.startServer();

    if (this.context.extension.getConfiguration().autoOpenOnReload) {
      this.openBrowserIfPossible();
    }
  };

  openFileInBrowser = (): void => {
    if (!this.server.isRunning()) {
      throw Error(Messages.SERVER_IS_NOT_RUNNING);
    }

    this.openBrowserIfPossible();
  };

  stopServer = (): void => {
    if (this.server.isRunning()) {
      this.server.stop();
    }
  };

  private startServer() {
    this.server.start(this.getServerConfiguration());
    this.context.notify(Messages.SERVING_PROJECT);
  }

  private getServerConfiguration(): PHPServerConfig {
    const extensionConfig = this.context.extension.getConfiguration();

    const relativePath = extensionConfig.relativePath || '.';

    return {
      host: extensionConfig.ip || 'localhost',
      port: extensionConfig.port || 3000,
      rootPath: this.context.getRootPath()!, // TODO handle optionality
      relativePath,
      phpExecutablePath: extensionConfig.phpPath || 'php',
      phpRouterPath: this.getPhpServerRouterPath(
        relativePath,
        extensionConfig.router
      ),
      phpConfigPath: extensionConfig.phpConfigPath,
    };
  }

  private getPhpServerRouterPath(
    relativePath: string,
    routerPathFromConfig?: string
  ) {
    if (!routerPathFromConfig && platform() === 'win32') {
      process.env.PHP_SERVER_RELATIVE_PATH = relativePath;
      return `${this.context.extension.path}\\src\\server\\logger.php`;
    }

    return routerPathFromConfig;
  }

  private openBrowserIfPossible() {
    const { host, port } = this.server.getCurrentConfig() || {};
    const rootPath = this.context.getRootPath();

    if (!rootPath || !host || !port) {
      return;
    }

    const { browser } = this.context.extension.getConfiguration();
    const absolutePathToActiveFile = this.context.getAbsolutePathToActiveFile();

    const relativePathToActiveFile = relative(
      rootPath,
      absolutePathToActiveFile || rootPath
    ).replace(/\\/g, '/');

    const url = `http://${host}:${port}/${relativePathToActiveFile}`;

    new AnyBrowser(browser).open(url);
  }
}
