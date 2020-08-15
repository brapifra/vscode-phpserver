import * as vscode from 'vscode';
import { spawn, spawnSync } from 'child_process';
import { platform } from 'os';
import * as open from 'open';
import * as path from 'path';
import CommandController from '../CommandController';
import { ExtensionConfiguration } from '../../extension';
import Messages from '../../Messages';
import VSCodeOutputChannelMock from '../../__mocks__/VSCodeOutputChannelMock';

jest.mock('child_process', () => ({
  spawn: jest.fn(() => ({
    stdout: undefined,
    stderr: undefined,
    on: jest.fn(),
    kill: jest.fn(),
  })),
  spawnSync: jest.fn(() => ({ status: 0 })),
  exec: jest.fn(),
}));

jest.mock('open', () => jest.fn());

const contextMock = {
  extension: {
    path: 'fake-path',
    getConfiguration: jest.fn(() => defaultConfig),
  },
  getRootPath: jest.fn(() => 'rootPath'),
  getAbsolutePathToActiveFile: jest.fn(() => undefined),
  notify: jest.fn(),
};

beforeEach(() => {
  (spawn as jest.Mock).mockClear();
  (spawnSync as jest.Mock).mockClear();
  (open as jest.Mock).mockClear();
});

const defaultConfig: ExtensionConfiguration = {
  ip: '0.0.0.0',
  port: 3333,
  browser: 'firefox',
  relativePath: './',
};

describe('CommandController', () => {
  let controller: CommandController;

  beforeEach(() => {
    contextMock.extension.getConfiguration.mockClear();
    contextMock.extension.getConfiguration.mockImplementation(
      () => defaultConfig
    );
    contextMock.notify.mockClear();
    contextMock.getRootPath.mockClear();
    contextMock.getAbsolutePathToActiveFile.mockClear();

    controller = new CommandController(contextMock);
  });

  it('should log any error from the running server', () => {
    const expectedError = new Error('Error');

    const onEventMock = (eventType: string, callback: any) => {
      if (eventType === 'error') {
        callback(expectedError);
      }
    };

    (spawn as jest.Mock).mockImplementationOnce(() => ({
      stdout: undefined,
      stderr: undefined,
      on: onEventMock,
      kill: jest.fn(),
    }));

    expect(VSCodeOutputChannelMock.show).toBeCalledTimes(0);
    expect(VSCodeOutputChannelMock.appendLine).toBeCalledTimes(0);

    controller.serveProject();

    expect(VSCodeOutputChannelMock.show).toBeCalledTimes(2);
    expect(VSCodeOutputChannelMock.appendLine).toBeCalledTimes(1);
    expect(VSCodeOutputChannelMock.appendLine).toBeCalledWith(
      expectedError.stack
    );
  });

  describe('serveProject', () => {
    it('should create a server with the correct configuration', () => {
      mockGetConfigurationOnce(defaultConfig);

      expect(VSCodeOutputChannelMock.clear).toBeCalledTimes(0);
      expect(VSCodeOutputChannelMock.show).toBeCalledTimes(0);
      expect(contextMock.notify).toBeCalledTimes(0);

      controller.serveProject();

      expectDefaultServerExecution();
      expect(VSCodeOutputChannelMock.clear).toBeCalledTimes(1);
      expect(VSCodeOutputChannelMock.show).toBeCalledTimes(1);
      expect(contextMock.notify).toBeCalledTimes(1);
      expect(contextMock.notify).toBeCalledWith(Messages.SERVING_PROJECT);
    });
    it('should not create a server if there is already one running', () => {
      controller.serveProject();
      expect(spawn).toBeCalledTimes(1);
      expect(open).toBeCalledTimes(1);

      expect(() => controller.serveProject()).toThrow(
        Messages.SERVER_IS_ALREADY_RUNNING
      );
    });

    it('should throw an error if php was not found', () => {
      (spawnSync as jest.Mock).mockImplementationOnce(() => ({ status: 1 }));

      expect(spawnSync).toBeCalledTimes(0);

      expect(() => controller.serveProject()).toThrow(Messages.PHP_NOT_FOUND);

      expect(spawnSync).toBeCalledTimes(1);
      expect(spawnSync).toBeCalledWith('php', ['--version'], {
        cwd: 'rootPath',
      });
      expect(spawn).toBeCalledTimes(0);
      expect(open).toBeCalledTimes(0);
    });
  });
  describe('reloadServer', () => {
    it("should stop the server if it's running", () => {
      contextMock.extension.getConfiguration.mockImplementation(() => ({
        ...defaultConfig,
        autoOpenOnReload: true,
      }));

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
      expect(open).toBeCalledTimes(1);
      expectDefaultServerExecution();

      controller.reloadServer();
      expect(spawnKillMock).toBeCalledTimes(1);
      expect(spawn).toBeCalledTimes(2);
      expect(open).toBeCalledTimes(2);
    });

    it('should not re-open file in browser if autoOpenOnReload is not set', () => {
      controller.serveProject();
      expect(open).toBeCalledTimes(1);

      mockGetConfigurationOnce(defaultConfig);
      controller.reloadServer();
      expect(open).toBeCalledTimes(1);
    });

    it('should re-open file in browser if autoOpenOnReload is set to true', () => {
      controller.serveProject();
      expect(open).toBeCalledTimes(1);

      contextMock.extension.getConfiguration.mockImplementation(() => ({
        ...defaultConfig,
        autoOpenOnReload: true,
      }));

      controller.reloadServer();
      expect(open).toBeCalledTimes(2);
    });
  });

  describe('openFileInBrowser', () => {
    it('should open file in browser', () => {
      mockGetConfigurationOnce(defaultConfig);
      controller.serveProject();

      expect(vscode.window.showErrorMessage).not.toBeCalled();

      expect(spawn).toBeCalledTimes(1);
      expectDefaultServerExecution();
      expect(open).toBeCalledTimes(1);

      (open as jest.Mock).mockClear();
      mockGetConfigurationOnce(defaultConfig);
      controller.openFileInBrowser();
      expectDefaultServerExecution();
    });
    it('should show an error message if the server is not running', () => {
      expect(() => controller.openFileInBrowser()).toThrow(
        Messages.SERVER_IS_NOT_RUNNING
      );
      expect(spawn).toBeCalledTimes(0);
    });
    it('should open the browser with the correct path', () => {
      const getAbsolutePathToActiveFile = jest.fn(() =>
        path.normalize('/rootPath/test/test.php')
      );
      const controller = new CommandController({
        ...contextMock,
        extension: { path: 'fake-path', getConfiguration: () => ({}) },
        getAbsolutePathToActiveFile,
        getRootPath: () => path.normalize('/rootPath'),
      });

      mockGetConfigurationOnce(defaultConfig);
      controller.serveProject();
      expect(getAbsolutePathToActiveFile).toBeCalledTimes(1);
      expect(open).toBeCalledTimes(1);

      mockGetConfigurationOnce(defaultConfig);
      controller.openFileInBrowser();
      expect(open).toBeCalledTimes(2);
      expect(getAbsolutePathToActiveFile).toBeCalledTimes(2);
      expect(open).toBeCalledWith(`http://localhost:3000/test/test.php`, {
        url: true,
      });
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
      expect(open).toBeCalledTimes(1);
    });
  });
});

const expectedDefaultArgs =
  platform() === 'win32'
    ? ['-S', '0.0.0.0:3333', '-t', './', 'fake-path\\src\\server\\logger.php']
    : ['-S', '0.0.0.0:3333', '-t', './'];

function expectDefaultServerExecution() {
  expect(spawn).toBeCalledWith('php', expectedDefaultArgs, {
    cwd: 'rootPath',
  });
  expect(open).toBeCalledTimes(1);
  expect(open).toBeCalledWith('http://0.0.0.0:3333/', {
    url: true,
    app: defaultConfig.browser,
  });
}

function mockGetConfigurationOnce(config: ExtensionConfiguration) {
  contextMock.extension.getConfiguration.mockImplementationOnce(() => config);
}
