import * as vscode from 'vscode';
import Messages from './Messages';

export default class BreakingChangesNotifier {
  constructor(public globalState: vscode.Memento) {}

  notifyIfRequired() {
    if (
      this.doesCurrentVersionContainBreakingChanges() &&
      !this.wasBreakingChangesWarningDismissed()
    ) {
      vscode.window
        .showInformationMessage(Messages.BROWSER_BREAKING_CHANGES, Messages.OK)
        .then((result) => {
          if (result === Messages.OK)
            this.globalState.update('BREAKING_CHANGES_DISMISSED', true);
        });
    }
  }

  private doesCurrentVersionContainBreakingChanges(): boolean {
    const extension = vscode.extensions.getExtension(
      'brapifra.vscode-phpserver'
    );

    return extension?.packageJSON.version >= '3.0.0';
  }

  private wasBreakingChangesWarningDismissed() {
    return this.globalState.get('BREAKING_CHANGES_DISMISSED', false);
  }
}
