import { spawn, ChildProcess } from 'child_process';

type ServerEvent = 'data' | 'error' | 'close';

type ServerEventHandler = (data: string) => void;

export interface PHPServerConfig {
  host: string;
  port: number;
  rootPath: string;
  relativePath: string;
  phpExecutablePath: string;
  phpRouterPath?: string;
  phpConfigPath?: string;
}

export default class PHPServer {
  private process?: ChildProcess;
  private listeners: Array<[ServerEvent, ServerEventHandler]> = [];
  private config?: PHPServerConfig;

  constructor() {}

  on(event: ServerEvent, handler: ServerEventHandler): void {
    this.listeners.push([event, handler]);
  }

  start(config: PHPServerConfig): void {
    this.config = config;

    this.process = spawn(
      config.phpExecutablePath,
      this.getProcessArgs(config),
      {
        cwd: config.rootPath,
      }
    );

    this.setupProcessListeners();
  }

  stop(): void {
    this.process?.kill();
    this.process = undefined;
  }

  isRunning() {
    return !!this.process;
  }

  getCurrentConfig(): PHPServerConfig | undefined {
    return this.config;
  }

  private getProcessArgs(config: PHPServerConfig): string[] {
    const args: string[] = [
      '-S',
      `${config.host}:${config.port}`,
      '-t',
      config.relativePath,
    ];

    if (config.phpConfigPath) {
      args.push('-c');
      args.push(config.phpConfigPath);
    }

    if (config.phpRouterPath) {
      args.push(config.phpRouterPath);
    }

    return args;
  }

  private setupProcessListeners() {
    this.listeners.forEach(([event, eventHandler]) => {
      this.setupSingleProcessListener(event, eventHandler);
    });
  }

  private setupSingleProcessListener(
    event: ServerEvent,
    eventHandler: ServerEventHandler
  ) {
    if (event === 'data') {
      this.process?.stdout?.on(event, (data: Buffer): void => {
        eventHandler(data.toString());
      });
      this.process?.stderr?.on(event, (data: Buffer): void => {
        eventHandler(data.toString());
      });
    } else if (event === 'error') {
      this.process?.on(event, (error: Error) => {
        eventHandler(error.stack || error.message);
      });
    } else {
      this.process?.on(event, eventHandler);
    }
  }
}
