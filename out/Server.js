"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const child_process_1 = require("child_process");
const os_1 = require("os");
class Server {
    constructor(ip, port, relativePath, extensionPath) {
        this.running = false;
        this.outputChanneL = vscode.window.createOutputChannel("PHP Server");
        this.ip = ip;
        this.port = port;
        this.relativePath = relativePath;
        this.extensionPath = extensionPath;
    }
    shutDown() {
        if (this.running && this.terminal !== undefined) {
            this.terminal.kill();
            this.terminal = undefined;
            this.running = false;
        }
    }
    isRunning() {
        return this.running && this.terminal !== undefined;
    }
    setPhpPath(phpPath) {
        this.phpPath = phpPath;
    }
    setRouter(router) {
        this.router = router;
    }
    run(cb) {
        if (this.isRunning()) {
            vscode.window.showErrorMessage("Server is already running!");
            return;
        }
        this.outputChanneL.clear();
        this.outputChanneL.show();
        this.terminal = child_process_1.spawn(this.phpPath ? this.phpPath : "php", this.argsToArray(), {
            cwd: vscode.workspace.rootPath
        });
        this.terminal.stdout.on("data", (data) => {
            this.outputChanneL.appendLine(data.toString());
        });
        this.terminal.stderr.on("data", (data) => {
            this.outputChanneL.appendLine(data.toString());
        });
        this.terminal.on("error", (err) => {
            this.running = false;
            vscode.window.showErrorMessage(`Server error: ${err.stack}`);
        });
        this.terminal.on("close", code => {
            this.shutDown();
            vscode.window.showInformationMessage("Server Stopped");
        });
        this.running = true;
        cb();
        vscode.window.showInformationMessage("Serving Project");
    }
    argsToArray() {
        const args = ["-S", `${this.ip}:${this.port}`];
        args.push("-t");
        args.push(this.relativePath);
        if (this.router) {
            args.push(this.router);
        }
        else if (os_1.platform() === "win32") {
            args.push(`${this.extensionPath}\\src\\logger.php`);
            process.env.PHP_SERVER_RELATIVE_PATH = this.relativePath;
        }
        return args;
    }
    execBrowser(browser, fullFileName) {
        const ip = this.ip;
        const port = this.port;
        const fileName = this.fullToRelativeFileName(fullFileName);
        switch (browser.toLowerCase()) {
            case "firefox":
                if (os_1.platform() === 'linux') {
                    browser = `${browser} http://${ip}:${port}/${fileName}`;
                }
                else if (os_1.platform() === "win32") {
                    browser = `start ${browser} http://${ip}:${port}/${fileName}`;
                }
                else if (os_1.platform() === 'darwin') {
                    browser = `open -a "Firefox" http://${ip}:${port}/${fileName}`;
                }
                else {
                    browser = '';
                }
                break;
            case "chrome":
                if (os_1.platform() === 'linux') {
                    browser = `google-chrome http://${ip}:${port}/${fileName}`;
                }
                else if (os_1.platform() === "win32") {
                    browser = `start ${browser} http://${ip}:${port}/${fileName}`;
                }
                else if (os_1.platform() === 'darwin') {
                    browser = `open -a "Google Chrome" http://${ip}:${port}/${fileName}`;
                }
                else {
                    browser = '';
                }
                break;
            case "edge":
                if (os_1.platform() === 'win32') {
                    browser = `start microsoft-edge:http://${ip}:${port}/${fileName}`;
                }
                else {
                    browser = '';
                }
                break;
            case "safari":
                if (os_1.platform() === 'darwin') {
                    browser = `open -a "Safari" http://${ip}:${port}/${fileName}`;
                }
                else {
                    browser = '';
                }
        }
        if (browser !== "") {
            child_process_1.exec(browser);
        }
    }
    fullToRelativeFileName(fullFileName) {
        if (!fullFileName) {
            return '';
        }
        let i = 0;
        if (this.relativePath.length > 1) {
            let char = os_1.platform() === 'win32' ? '\\' : '/';
            let relativePath = this.relativePath;
            if (relativePath.startsWith('.' + char)) {
                relativePath = relativePath.substring(2);
            }
            const fullRelativePath = vscode.workspace.rootPath + char + relativePath;
            i = fullFileName.indexOf(fullRelativePath) + fullRelativePath.length;
            if (!fullRelativePath.endsWith(char)) {
                i++;
            }
        }
        else {
            i = fullFileName.indexOf(vscode.workspace.rootPath) + vscode.workspace.rootPath.length + 1;
        }
        const ret = fullFileName.substring(i);
        return ret.replace(new RegExp(/\s/g), "%20");
    }
}
exports.default = Server;
//# sourceMappingURL=Server.js.map