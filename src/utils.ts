import * as vscode from 'vscode';
import { normalize } from 'path';
// @ts-ignore
import * as commondir from 'commondir';

export function getRootPath() {
  const absolutePathsOfWorkspaceFolders =
    vscode.workspace.workspaceFolders?.map(
      (workspaceFolder) => workspaceFolder.uri.fsPath
    ) || [];

  if (absolutePathsOfWorkspaceFolders.length === 0) {
    return;
  }

  return absolutePathsOfWorkspaceFolders.length > 0
    ? normalize(commondir(absolutePathsOfWorkspaceFolders))
    : undefined;
}
