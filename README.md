# [PHP Server](https://github.com/brapifra/vscode-phpserver) ![CI](https://github.com/brapifra/vscode-phpserver/workflows/CI/badge.svg)

<a href='https://ko-fi.com/G2G54ANWH' target='_blank'>
    <img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi1.png?v=2' border='0' alt='Buy Me a Coffee at ko-fi.com' />
</a>

Host / serve current workspace (or subfolder) with PHP.

![demo](./assets/demo.gif)

## Getting started

There are multiple ways of running `PHP server`:

- `CTRL + SHIFT + P` and searching for `PHP Server: Serve project` command
- Clicking on vscode's editor button (icon on the top-right corner)
- Right-clicking on vscode's editor when a `.php` or an `.html` is open.

To stop the server, the `PHP Server: Stop project` command can be executed likewise.

## Commands

All commands can be executed by pressing `CTRL + SHIFT + P` and typing the name of the command.

| Command                            | Notes                                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `PHP Server: Serve project`        |                                                                                                                |
| `PHP Server: Stop project`         |                                                                                                                |
| `PHP Server: Reload server`        | Stops the running server and starts it again.                                                                  |
| `PHP Server: Open file in browser` | Quickly opens the URL of the active file in the browser. If the server is not running, this command will fail. |

## Settings

| Setting                      | Default     | Notes                                                                                                                                                                                                                                                                                                                     |
| ---------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `phpserver.autoOpenOnReload` | `true`      | Enable/disable automatic opening of server's URL in the browser after server has been reloaded.                                                                                                                                                                                                                           |
| `phpserver.browser`          | `null`      | App used to open the server URL. If empty, it will use the default browser.<br/> You can put **any** browser name here as long as it's installed in your machine (e.g. `google-chrome`, `firefox`, `chromium-browser`...)                                                                                                 |
| `phpserver.ip`               | `localhost` | Server's ip/hostname (e.g. `localhost`, `0.0.0.0`...)                                                                                                                                                                                                                                                                     |
| `phpserver.phpConfigPath`    | `null`      | Path to `php.ini` file. If empty, the extension uses the default path.                                                                                                                                                                                                                                                    |
| `phpserver.phpPath`          | `null`      | Path to PHP executable. If empty, the extension will try to get the path from the `$PATH` environment variable.                                                                                                                                                                                                           |
| `phpserver.port`             | `3000`      | Server's port number.                                                                                                                                                                                                                                                                                                     |
| `phpserver.relativePath`     | `"."`       | Path relative to project. This is useful when you want to serve a different folder than the one from current workspace.                                                                                                                                                                                                   |
| `phpserver.router`           | `null`      | Path to custom router script that will be used by PHP server. [Example](https://www.php.net/manual/en/features.commandline.webserver.php#example-421).<br/>If a custom router script is used on a Windows machine, there will be no console output unless a logger like [this](src/logger.php) is included in the script. |

## Requirements

- PHP needs to be installed in order to be able to use this extension.

## Author

[Brais Piñeiro](http://github.com/brapifra)
