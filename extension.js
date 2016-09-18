var vscode = require('vscode');
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.serveProject', function () {
        var config=vscode.workspace.getConfiguration('phpserver');
        var terminal=vscode.window.createTerminal("PHP Server");
        terminal.sendText("php -S localhost:"+config.get("port")+" -t "+vscode.workspace.rootPath+"/"+config.get("relativeurl"));
        vscode.window.showInformationMessage('Serving Project');
    }));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;