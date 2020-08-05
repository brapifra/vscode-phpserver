import VSCodeOutputChannelMock from '../src/__mocks__/VSCodeOutputChannelMock';

export const window = {
  showErrorMessage: jest.fn(),
  showInformationMessage: jest.fn((_, opt) => Promise.resolve(opt)),
  createOutputChannel: jest.fn(() => VSCodeOutputChannelMock),
};

export const workspace = {
  getConfiguration: jest.fn(() => ({
    get: jest.fn(() => 'some-config'),
  })),
  rootPath: 'rootPath',
};

export const commands = {
  registerCommand: jest.fn(),
};

export const extensions = {
  getExtension: jest.fn(() => ({
    packageJSON: {
      version: '3.0.0',
    },
  })),
};

beforeEach(() => {
  window.createOutputChannel.mockClear();
  window.showErrorMessage.mockClear();
  window.createOutputChannel.mockClear();
  workspace.getConfiguration.mockClear();
  commands.registerCommand.mockClear();
  VSCodeOutputChannelMock.appendLine.mockClear();
  VSCodeOutputChannelMock.clear.mockClear();
  VSCodeOutputChannelMock.show.mockClear();
});
