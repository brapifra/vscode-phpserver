import * as vscode from 'vscode';
import Messages from './Messages';

const EXTENSION_ID = 'brapifra.phpserver';

enum GlobalStateField {
  BREAKING_CHANGES_DISMISSED = 'BREAKING_CHANGES_DISMISSED',
}

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
            this.globalState.update(
              GlobalStateField.BREAKING_CHANGES_DISMISSED,
              true
            );
        });
    }
  }

  private doesCurrentVersionContainBreakingChanges(): boolean {
    const extension = vscode.extensions.getExtension(EXTENSION_ID);

    return extension?.packageJSON.version >= '3.0.0';
  }

  private wasBreakingChangesWarningDismissed() {
    return this.globalState.get(
      GlobalStateField.BREAKING_CHANGES_DISMISSED,
      false
    );
  }
}
