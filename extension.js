var vscode = require('vscode');
var os = require('os');
var config = vscode.workspace.getConfiguration('phpserver');
var browser = config.get("browser");
var relativeurl = config.get("relativeurl");
var port = config.get("port");
var executablepath = config.get("executable");
var platform = os.platform();
switch (browser) {
    case "firefox":
        if (platform == 'linux' || platform == 'darwin') {
            browser = browser + " http:/localhost:" + port;
        } else if (platform == 'win32') {
            browser = "start " + browser + " http:/localhost:" + port;
        }
        break;
    case "chrome":
        if (platform == 'linux' || platform == 'darwin') {
            browser = "google-chrome http:/localhost:" + port;
        } else if (platform == 'win32') {
            browser = "start " + browser + " http:/localhost:" + port;
        }
        break;
}

var serverterminal;
var browserterminal;
var running;
function activate(context) {
    var out = vscode.window.createOutputChannel("PHP Server");
    context.subscriptions.push(vscode.commands.registerCommand('extension.serveProject', function () {
        if (serverterminal && running) {
            vscode.window.showErrorMessage('Server already running!');
            return;
        }
        out.clear();
        out.show();
        var args = ['-S', 'localhost:' + port];
        if (relativeurl != "") {
            args.push("-t");
            args.push(relativeurl);
        }
        serverterminal = require('child_process').spawn(executablepath, args, { cwd: vscode.workspace.rootPath });
        running = true;
        serverterminal.stdout.on('data', function (data) {
            out.appendLine(data.toString());
        });
        serverterminal.stderr.on('data', function (data) {
            out.appendLine(data.toString());
        });
        serverterminal.on('close', function (code) {
            if (running) {
                vscode.window.showInformationMessage('Server stopped');
                running = false;
                out.hide();
            }
        });
        serverterminal.on('error', function (error) {
            if (running) {
                vscode.window.showInformationMessage('Server failed to start');
                running = false;
            }
            out.appendLine(error);
        });
        setTimeout(function () {
            if (serverterminal && running) {
                vscode.window.showInformationMessage('Serving project');
                if (!browserterminal && browser != "") {
                    browserterminal = require('child_process').exec(browser);
                }
            }
        }, 500);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.stopServer', function () {
        deactivate();
    }));
}
exports.activate = activate;
function deactivate() {
    if (serverterminal && running) {
        serverterminal.kill();
        serverterminal = undefined;
    }
}
exports.deactivate = deactivate;
