import * as vscode from 'vscode';
import CommandController from '../CommandController';
import { spawn, exec } from 'child_process';

jest.mock('child_process', () => ({
  spawn: jest.fn(() => ({
    stdout: undefined,
    stderr: undefined,
    on: jest.fn(),
    kill: jest.fn(),
  })),
  exec: jest.fn(),
}));

beforeEach(() => {
  (spawn as any).mockClear();
  (exec as any).mockClear();
});

const defaultConfig: { [key: string]: any } = {
  ip: '0.0.0.0',
  port: '3333',
  browser: 'firefox',
  relativePath: './',
};

describe('CommandController', () => {
  let controller: CommandController;

  beforeEach(() => {
    controller = new CommandController({
      extensionPath: 'fake-path',
      getActiveFileName: () => undefined,
    });
  });

  describe('serveProject', () => {
    it('should create a server with the correct configuration', () => {
      mockGetConfigurationOnce(defaultConfig);

      controller.serveProject();

      expectDefaultServerExecution();
      expect(vscode.window.showErrorMessage).toBeCalledTimes(0);
      expect(vscode.window.showInformationMessage).toBeCalledTimes(1);
      expect(vscode.window.showInformationMessage).toBeCalledWith(
        'Serving Project'
      );
    });
    it('should not create a server if there is already one running', () => {
      controller.serveProject();
      expect(spawn).toBeCalledTimes(1);
      expect(exec).toBeCalledTimes(1);
      expect(vscode.window.showErrorMessage).toBeCalledTimes(0);

      controller.serveProject();
      expect(spawn).toBeCalledTimes(1);
      expect(exec).toBeCalledTimes(1);
      expect(vscode.window.showErrorMessage).toBeCalledTimes(1);
      expect(vscode.window.showErrorMessage).toBeCalledWith(
        'Server is already running!'
      );
    });
  });
  describe('reloadServer', () => {
    it("should stop the server if it's running", () => {
      mockGetConfigurationOnce(defaultConfig);

      const spawnKillMock = jest.fn();
      (spawn as jest.Mock).mockImplementationOnce(
        jest.fn(() => ({
          stdout: undefined,
          stderr: undefined,
          on: jest.fn(),
          kill: spawnKillMock,
        }))
      );

      controller.reloadServer();

      expect(spawnKillMock).not.toBeCalled();
      expect(spawn).toBeCalledTimes(1);
      expect(exec).toBeCalledTimes(1);
      expectDefaultServerExecution();

      controller.reloadServer();
      expect(spawnKillMock).toBeCalledTimes(1);
      expect(spawn).toBeCalledTimes(2);
      expect(exec).toBeCalledTimes(2);
    });

    it('should not re-open file in browser if autoOpenOnReload is not set', () => {
      controller.serveProject();
      expect(exec).toBeCalledTimes(1);

      mockGetConfigurationOnce(defaultConfig);
      controller.reloadServer();
      expect(exec).toBeCalledTimes(1);
    });

    it('should re-open file in browser if autoOpenOnReload is set to true', () => {
      controller.serveProject();
      expect(exec).toBeCalledTimes(1);

      mockGetConfigurationOnce({ ...defaultConfig, autoOpenOnReload: true });
      controller.reloadServer();
      expect(exec).toBeCalledTimes(2);
    });
  });

  describe('openFileInBrowser', () => {
    it('should open file in browser', () => {
      mockGetConfigurationOnce(defaultConfig);
      controller.serveProject();

      expect(vscode.window.showErrorMessage).not.toBeCalled();

      expect(spawn).toBeCalledTimes(1);
      expectDefaultServerExecution();
      expect(exec).toBeCalledTimes(1);

      (exec as any).mockClear();
      mockGetConfigurationOnce(defaultConfig);
      controller.openFileInBrowser();
      expect(exec).toBeCalledTimes(1);
      expect(exec).toBeCalledWith('firefox http://0.0.0.0:3333/');
    });
    it('should show an error message if the server is not running', () => {
      controller.openFileInBrowser();
      expect(vscode.window.showErrorMessage).toBeCalledTimes(1);
      expect(vscode.window.showErrorMessage).toBeCalledWith(
        'Server is not running!'
      );
      expect(spawn).toBeCalledTimes(0);
    });
    it('should open the browser with the correct path', () => {
      const getActiveFileName = jest.fn(() => '/rootPath/test/test.php');
      const controller = new CommandController({
        extensionPath: 'fake-path',
        getActiveFileName,
      });

      mockGetConfigurationOnce(defaultConfig);
      controller.serveProject();
      expect(getActiveFileName).toBeCalledTimes(1);
      expect(exec).toBeCalledTimes(1);

      mockGetConfigurationOnce(defaultConfig);
      controller.openFileInBrowser();
      expect(exec).toBeCalledTimes(2);
      expect(getActiveFileName).toBeCalledTimes(2);
      expect(exec).toBeCalledWith(`firefox http://0.0.0.0:3333/test/test.php`);
    });
  });

  describe('stopServer', () => {
    it("should stop the server if it's running", () => {
      mockGetConfigurationOnce(defaultConfig);
      const spawnKillMock = jest.fn();
      (spawn as jest.Mock).mockImplementationOnce(
        jest.fn(() => ({
          stdout: undefined,
          stderr: undefined,
          on: jest.fn(),
          kill: spawnKillMock,
        }))
      );

      controller.stopServer();
      expect(spawnKillMock).not.toBeCalled();

      controller.serveProject();
      controller.stopServer();

      expect(spawnKillMock).toBeCalledTimes(1);
      expect(spawn).toBeCalledTimes(1);
      expect(exec).toBeCalledTimes(1);
    });
  });
});

function expectDefaultServerExecution() {
  expect(spawn).toBeCalledWith('php', ['-S', '0.0.0.0:3333', '-t', './'], {
    cwd: 'rootPath',
  });
  expect(exec).toBeCalledWith('firefox http://0.0.0.0:3333/');
}

function mockGetConfigurationOnce(config: { [key: string]: any }) {
  const getConfigValue = jest.fn((key: string) => config[key]);
  (vscode.workspace.getConfiguration as jest.Mock).mockImplementationOnce(
    () => ({
      get: getConfigValue,
    })
  );
  return getConfigValue;
}
