import * as vscode from 'vscode';

export interface Logger {
  clear(): void;
  show(): void;
  appendLine(message: string): void;
}

export default class VSCodeLogger implements Logger {
  private outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel(
    this.name
  );

  constructor(private name: string) {}

  clear = () => {
    this.outputChannel.clear();
  };

  show = () => {
    this.outputChannel.show();
  };

  appendLine = (message: string) => {
    this.outputChannel.appendLine(message);
  };
}
