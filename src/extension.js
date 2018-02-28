const vscode = require("vscode");
const child = require("child_process");
const platform = require("os").platform();
const out = vscode.window.createOutputChannel("PHP Server");;
let config, port, ip, browser;
let serverterminal;
let browserterminal;

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.serveProject", function () {
      if (serverterminal) {
        vscode.window.showErrorMessage("Server is already running!");
        return;
      }

      config = vscode.workspace.getConfiguration("phpserver");
      const relativePath = config.get("relativePath");
      const router = config.get("router");
      const phpPath = config.get("phpPath");
      const wsPHP = config.get("MultiWorkSpace");
      port = config.get("port");
      ip = config.get("ip");

      out.clear();
      out.show();
      const args = ["-S", `${ip}:${port}`];
      if (relativePath != "") {
        args.push("-t");
        args.push(relativePath);
      }
      if (router !== "") {
        args.push(router);
      } else if (platform == "win32") {
        args.push(`${context.extensionPath}\\src\\logger.php`);
        if (relativePath != "") {
          process.env.PHP_SERVER_RELATIVE_PATH = relativePath;
        }
      }
      let folder = vscode.workspace.workspaceFolders[0];
      if(wsPHP !== false)
      {
        vscode.window.showWorkspaceFolderPick().then(function(folder)
          {
            servidor(phpPath,args,folder);
          });
      }else{
          servidor(phpPath,args,folder);        
      }
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.stopServer", deactivate)
  );
}
function servidor(phpPath,args,folder)
{
  if(typeof folder == "OBJECT")
    folder = folder.uri.fsPath;
  serverterminal = child.spawn(phpPath !== null ? phpPath : "php", args, {
    cwd: folder.uri.fsPath
  });
  
  console.log(folder.uri.fsPath);
  checkBrowser();

  serverterminal.stdout.on("data", function (data) {
    out.appendLine(data.toString());
  });
  serverterminal.stderr.on("data", function (data) {
    out.appendLine(data.toString());
  });
  serverterminal.on("error", err => {
    vscode.window.showErrorMessage(`Server error: ${err.message}`);
  });
  serverterminal.on("close", function (code) {
    vscode.window.showInformationMessage("Server Stopped");
    deactivate();
  });
  vscode.window.showInformationMessage("Serving Project");
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
  browser = config.get("browser");
  switch (browser.toLowerCase()) {
    case "firefox":
      if (platform === 'linux') {
        browser = `${browser} http://${ip}:${port}`;
      } else if (platform == "win32") {
        browser = `start ${browser} http://${ip}:${port}`;
      } else if (platform === 'darwin') {
        browser = `open -a "Firefox" http://${ip}:${port}`;
      } else {
        browser = '';
      }
      break;
    case "chrome":
      if (platform === 'linux') {
        browser = `google-chrome http://${ip}:${port}`;
      } else if (platform == "win32") {
        browser = `start ${browser} http://${ip}:${port}`;
      } else if (platform === 'darwin') {
        browser = `open -a "Google Chrome" http://${ip}:${port}`;
      } else {
        browser = '';
      }
      break;
    case "edge":
      if (platform === 'win32') {
        browser = `start microsoft-edge:http://${ip}:${port}`;
      } else {
        browser = '';
      }
      break;
    case "safari":
      if (platform === 'darwin') {
        browser = `open -a "Safari" http://${ip}:${port}`;
      } else {
        browser = '';
      }
  }
  if (browser !== "") {
    browserterminal = child.exec(browser);
  }
}
