const vscode = require("vscode");
const child = require("child_process");
const platform = require("os").platform();
const config = vscode.workspace.getConfiguration("phpserver");
const relativePath = config.get("relativePath");
const port = config.get("port");
const ip = config.get("ip");
let browser = config.get("browser");
let serverterminal;
let browserterminal;

function activate(context) {
  checkBrowser();
  const out = vscode.window.createOutputChannel("PHP Server");
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.serveProject", function() {
      if (serverterminal) {
        vscode.window.showErrorMessage("Server is already running!");
        return;
      }
      out.clear();
      out.show();
      const args = ["-S", `${ip}:${port}`];
      if (relativePath != "") {
        args.push("-t");
        args.push(relativePath);
      }
      if (platform == "win32") {
        args.push(`${context.extensionPath}\\src\\logger.php`);
        if (relativePath != "") {
          process.env.PHP_SERVER_RELATIVE_PATH = relativePath;
        }
      }

      serverterminal = child.spawn("php", args, {
        cwd: vscode.workspace.rootPath
      });
      serverterminal.stdout.on("data", function(data) {
        out.appendLine(data.toString());
      });
      serverterminal.stderr.on("data", function(data) {
        out.appendLine(data.toString());
      });
      serverterminal.on("close", function(code) {
        vscode.window.showInformationMessage("Server Stopped");
        deactivate();
        out.hide();
      });
      vscode.window.showInformationMessage("Serving Project");
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.stopServer", deactivate)
  );
  if (browser !== "") {
    browserterminal = child.exec(browser);
  }
}
exports.activate = activate;
function deactivate() {
  if (serverterminal) {
    serverterminal.kill();
    serverterminal = undefined;
  }
}
exports.deactivate = deactivate;
function checkBrowser() {
  switch (browser) {
    case "firefox":
      if (platform == "linux" || platform == "darwin") {
        browser = `${browser} http://${ip}:${port}`;
      } else if (platform == "win32") {
        browser = `start ${browser} http://${ip}:${port}`;
      }
      break;
    case "chrome":
      if (platform == "linux" || platform == "darwin") {
        browser = `google-chrome http://${ip}:${port}`;
      } else if (platform == "win32") {
        browser = `start ${browser} http://${ip}:${port}`;
      }
      break;
    case "edge":
      if (platform == "linux" || platform == "darwin") {
        browser = "";
      } else if (platform == "win32") {
        browser = `start microsoft-edge:http://${ip}:${port}`;
      }
      break;
  }
}
