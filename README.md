# PHP Server

Host/Serve current workspace (or subfolder) with PHP.

## Features

You can execute it with:<br>
-Ctrl+shift+P and searching for "Serve Project with PHP"<br>
-Clicking on the editor's button (right superior corner)<br>
-Right-clicking on the editor.<br>
To stop the server just search for "Stop PHP Server" or right-click on the editor.<br>
Now with Windows support, auto open localhost in browser.<br>

## Requirements

PHP installed.

## Extension Settings
This extension contributes the following settings:

* `phpserver.port`: Localhost port where server will be hosted (Default: 3000)
* `phpserver.relativeurl`: URL relative to workspace path, in case you want only host a subfolder of workspace (Default: "")
* `phpserver.browser`: Browser's name that will be opened when server starts, if value='' then no browser will be opened (Default: "firefox", Options: "chrome, firefox, ''").
* `phpserver.external`: The server is accessible from any interface of your machine, wired or wireless, will bind to all available IP addresses on the system.


## Release Notes
### 1.1.0
Code rewritten (almost):<br>
+Windows support.<br>
+Auto open localhost in browser (optional).<br>
+Added context menu commands.<br>
+Fixed problem with relative url.<br>
### 1.0.0
Initial release of PHP Server

## Bugs

####No console output in Windows
-----------------------------------------------------------------------------------------------------------

## For more information

* [Programo Luego Existo](http://programoluegoexisto.com)
* [GitHub](http://github.com/brapifra)

**Enjoy!**
