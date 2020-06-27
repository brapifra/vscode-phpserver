export const window = {
  showErrorMessage: jest.fn(),
  showInformationMessage: jest.fn(),
  createOutputChannel: jest.fn(() => ({
    clear: jest.fn(),
    show: jest.fn(),
  }))
};

export const workspace = {
  getConfiguration: jest.fn(() => ({
    get: jest.fn(() => 'some-config'),
  })),
  rootPath: 'rootPath',
};

beforeEach(() => {
  window.createOutputChannel.mockClear();
  window.showErrorMessage.mockClear();
  window.createOutputChannel.mockClear();
  workspace.getConfiguration.mockClear();
});
