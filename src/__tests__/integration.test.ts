import * as vscode from 'vscode';
import Messages from '../Messages';

describe('vscode-phpserver', () => {
  it('should register all the necessary commands on activation', async () => {
    const showErrorMessageSpy = jest.spyOn(vscode.window, 'showErrorMessage');

    const expectedCommands = [
      'extension.phpServer.serveProject',
      'extension.phpServer.reloadServer',
      'extension.phpServer.openFileInBrowser',
      'extension.phpServer.stopServer',
    ];

    // Given that the commands have not been registered yet
    const initialCommands = await vscode.commands.getCommands();
    expect(initialCommands).not.toEqual(
      expect.arrayContaining(expectedCommands)
    );

    expect(showErrorMessageSpy).not.toBeCalled();
    // When I execute an activation event
    await vscode.commands.executeCommand(
      'extension.phpServer.openFileInBrowser'
    );
    expect(showErrorMessageSpy).toBeCalledTimes(1);
    expect(showErrorMessageSpy).toBeCalledWith(Messages.SERVER_IS_NOT_RUNNING);

    // Then it should register all the necessary commands
    const commands = await vscode.commands.getCommands();
    expect(commands).toEqual(expect.arrayContaining(expectedCommands));
  });
  it('should activate itself when a command is executed', async () => {
    const extension = await vscode.extensions.getExtension(
      'brapifra.phpserver'
    );

    expect(extension?.packageJSON).toEqual(
      expect.objectContaining({
        activationEvents: [
          'onCommand:extension.phpServer.serveProject',
          'onCommand:extension.phpServer.openFileInBrowser',
          'onCommand:extension.phpServer.reloadServer',
        ],
      })
    );
  });
});
