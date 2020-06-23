import * as vscode from 'vscode';

describe('vscode-phpserver', () => {
  it('should register all the necessary commands on activation', async () => {
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

    // When I execute an activation event
    await vscode.commands.executeCommand(
      'extension.phpServer.openFileInBrowser'
    );

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
