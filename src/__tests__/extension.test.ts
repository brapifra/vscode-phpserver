import * as vscode from 'vscode';
import * as extension from '../extension';
import Messages from '../Messages';
import VSCodeMementoMock from '../__mocks__/VSCodeMementoMock';

type Props = Parameters<typeof extension['activate']>[0];
function activateExtension(props: Partial<Props> = {}) {
  extension.activate({
    subscriptions: [],
    extensionPath: '',
    globalState: new VSCodeMementoMock(),
    ...props,
  });
}

describe('vscode-phpserver', () => {
  describe('config.browser is truthy', () => {
    it("should show a message warning the user about breaking changes in the extension until it's dismissed", async () => {
      const globalState = new VSCodeMementoMock();

      // Given that the extension gets activated
      // And that the user dismisses the warning message
      const showInfoMessageSpy = jest
        .spyOn(vscode.window, 'showInformationMessage')
        .mockImplementationOnce(() => ({
          then: (onfullfilled: any) => onfullfilled(),
        }));

      expect(showInfoMessageSpy).not.toBeCalled();
      activateExtension({  globalState });
      expect(showInfoMessageSpy).toBeCalledTimes(1);

      // When the extension gets activated again
      // And the user clicks accepts the warning message
      showInfoMessageSpy.mockImplementationOnce(() => ({
        then: (onfullfilled: any) => onfullfilled('Ok'),
      }));
      activateExtension({  globalState });
      expect(showInfoMessageSpy).toBeCalledTimes(2);

      // Then the warning message should no longer appear
      activateExtension({  globalState });
      expect(showInfoMessageSpy).toBeCalledTimes(2);
      expect(showInfoMessageSpy).toBeCalledWith(
        Messages.BROWSER_BREAKING_CHANGES,
        'Ok'
      );
    });
  });
});
