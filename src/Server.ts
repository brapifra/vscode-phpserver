import * as vscode from 'vscode';
import { spawn, exec, ChildProcess } from 'child_process';
import { platform } from 'os';

export default class Server {
  private relativePath: string;
  private router?: string;
  private phpPath?: string;
  private extensionPath: string;
  private port: number;
  private ip: string;
  private terminal?: ChildProcess;
  private running: boolean = false;
  private outputChanneL: vscode.OutputChannel = vscode.window.createOutputChannel("PHP Server");

  constructor(ip: string, port: number, relativePath: string, extensionPath: string) {
    this.ip = ip;
    this.port = port;
    this.relativePath = relativePath;
    this.extensionPath = extensionPath;
  }

  public shutDown() {
    if (this.running && this.terminal !== undefined) {
      this.terminal.kill();
      this.terminal = undefined;
      this.running = false;
    }
  }

  public isRunning(): boolean {
    return this.running && this.terminal !== undefined;
  }

  public setPhpPath(phpPath: string) {
    this.phpPath = phpPath;
  }

  public setRouter(router: string) {
    this.router = router;
  }

  public run(cb: Function) {
    if (this.isRunning()) {
      vscode.window.showErrorMessage("Server is already running!");
      return;
    }

    this.outputChanneL.clear();
    this.outputChanneL.show();

    this.terminal = spawn(this.phpPath ? this.phpPath : "php", this.argsToArray(), {
      cwd: vscode.workspace.rootPath
    });

    this.terminal.stdout.on("data", (data: Buffer) => {
      this.outputChanneL.appendLine(data.toString());
    });
    this.terminal.stderr.on("data", (data: Buffer) => {
      this.outputChanneL.appendLine(data.toString());
    });
    this.terminal.on("error", (err: Error) => {
      this.running = false;
      vscode.window.showErrorMessage(`Server error: ${err.stack}`);
    });
    this.terminal.on("close", code => {
      this.shutDown();
      vscode.window.showInformationMessage("Server Stopped");
    });

    this.running = true;
    cb();
    vscode.window.showInformationMessage("Serving Project");
  }

  private argsToArray(): string[] {
    const args: string[] = ["-S", `${this.ip}:${this.port}`];
    args.push("-t");
    args.push(this.relativePath);

    if (this.router) {
      args.push(this.router);
    } else if (platform() === "win32") {
      args.push(`${this.extensionPath}\\src\\logger.php`);
      process.env.PHP_SERVER_RELATIVE_PATH = this.relativePath;
    }
    return args;
  }

  public execBrowser(browser: string, fullFileName?: string) {
    const ip = this.ip;
    const port = this.port;
    const fileName = this.fullToRelativeFileName(fullFileName);

    switch (browser.toLowerCase()) {
      case "firefox":
        if (platform() === 'linux') {
          browser = `${browser} http://${ip}:${port}/${fileName}`;
        } else if (platform() === "win32") {
          browser = `start ${browser} http://${ip}:${port}/${fileName}`;
        } else if (platform() === 'darwin') {
          browser = `open -a "Firefox" http://${ip}:${port}/${fileName}`;
        } else {
          browser = '';
        }
        break;
      case "chrome":
        if (platform() === 'linux') {
          browser = `google-chrome http://${ip}:${port}/${fileName}`;
        } else if (platform() === "win32") {
          browser = `start ${browser} http://${ip}:${port}/${fileName}`;
        } else if (platform() === 'darwin') {
          browser = `open -a "Google Chrome" http://${ip}:${port}/${fileName}`;
        } else {
          browser = '';
        }
        break;
      case "edge":
        if (platform() === 'win32') {
          browser = `start microsoft-edge:http://${ip}:${port}/${fileName}`;
        } else {
          browser = '';
        }
        break;
      case "safari":
        if (platform() === 'darwin') {
          browser = `open -a "Safari" http://${ip}:${port}/${fileName}`;
        } else {
          browser = '';
        }
    }
    if (browser !== "") {
      exec(browser);
    }

  }

  private fullToRelativeFileName(fullFileName?: string): string {
    if (!fullFileName) {
      return '';
    }

    let i = 0;

    if (this.relativePath.length > 1) {
      let char = platform() === 'win32' ? '\\' : '/';
      let relativePath = this.relativePath;
      if (relativePath.startsWith('.' + char)) {
        relativePath = relativePath.substring(2);
      }
      const fullRelativePath = vscode.workspace.rootPath + char + relativePath;
      i = fullFileName.indexOf(fullRelativePath) + fullRelativePath.length;
      if (!fullRelativePath.endsWith(char)) {
        i++;
      }
    } else {
      i = fullFileName.indexOf(vscode.workspace.rootPath) + vscode.workspace.rootPath.length + 1;
    }
    const ret = fullFileName.substring(i);
    return ret.replace(new RegExp(/\s/g),"%20");
  }
}