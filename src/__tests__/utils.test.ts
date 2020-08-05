import * as vscode from 'vscode';
import { getRootPath } from '../utils';
import * as path from 'path';

describe('Extension utils', () => {
  describe('getRootPath', () => {
    const originalVscodeWorkspaceFolders = vscode.workspace.workspaceFolders;
    beforeEach(() => {
      // @ts-ignore
      vscode.workspace.workspaceFolders = originalVscodeWorkspaceFolders;
    });

    it('should return undefined if there are no folders in the workspace', () => {
      expect(getRootPath()).toBeUndefined();
    });
    it('should return the path of the first folder if there is only one folder in the workspace', () => {
      const path = '/root/path';
      mockVscodeWorkspaceFolders([path]);
      expect(getRootPath()).toEqual(path);
    });
    it('should return the shortest common path amongst all the workspace folders', () => {
      const basePath = '/root/path';

      mockVscodeWorkspaceFolders([
        `${basePath}/1`,
        `${basePath}/2`,
        `${basePath}/1/2`,
        `${basePath}/2/2`,
      ]);
      expect(getRootPath()).toEqual(basePath);

      mockVscodeWorkspaceFolders([`${basePath}/1/3/2`, `${basePath}/1/3/1`]);
      expect(getRootPath()).toEqual(`${basePath}/1/3`);

      mockVscodeWorkspaceFolders([`${basePath}/1`, `${basePath}/11`]);
      expect(getRootPath()).toEqual(basePath);

      const windowsBasePath = 'C:\\root\\path';
      const normalizeSpy = jest
        .spyOn(path, 'normalize')
        .mockImplementationOnce((str: string) => str.replace(/\//g, '\\'));

      mockVscodeWorkspaceFolders([
        `${windowsBasePath}\\1`,
        `${windowsBasePath}\\11`,
      ]);
      expect(getRootPath()).toEqual(windowsBasePath);
      expect(normalizeSpy).toBeCalledTimes(1);
      expect(normalizeSpy).toBeCalledWith(windowsBasePath.replace(/\\/g, '/'));
    });
  });
});

function mockVscodeWorkspaceFolders(workspaceFolders?: string[]) {
  // @ts-ignore
  vscode.workspace.workspaceFolders = workspaceFolders?.map((folderPath) => ({
    uri: {
      fsPath: folderPath,
    } as any,
  }));
}
