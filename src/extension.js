const vscode = require("vscode");
const child = require("child_process");
const platform = require("os").platform();

let port;
let ip;
let browser;

let serverterminal;
let browserterminal;

function activate(context) {
  
  const out = vscode.window.createOutputChannel("PHP Server");
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.serveProject", function() {
      if (serverterminal) {
        vscode.window.showErrorMessage("Server is already running!");
        return;
      }
      
      let config = vscode.workspace.getConfiguration("phpserver");
      let relativePath = config.get("relativePath");
      port = config.get("port");
      ip = config.get("ip");
      browser = config.get("browser");

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
      checkBrowser();
      if (browser !== "") {
        browserterminal = child.exec(browser);
      }
    
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.stopServer", deactivate)
  );
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