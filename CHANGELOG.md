# Changelog

### 3.1.0
* Visualize with icon if server is running, gray icon if not running, blue if running. If running a click will now trigger open in browser instead of error
* Toggle file menu options depending on server status, only show relevant actions depending on if server is running

### 3.0.1
* BreakingChangesNotifier: Corrected extension identifier

### 3.0.0
* Changed behaviour of `phpserver.browser` setting. It now supports any application installed in the host machine. If empty, it will open the default browser.
* Improved error messages. Errors are logged in vscode's output channel.
* Added logic to show notification if PHP was not found.
* Added support for workspaces with multiple folders.
* Changed package.json's vscode engine to proper version.
* Major refactor + tests.
* Updated README.md

### 2.4.6
* Demo gif

### 2.4.5
* Fix #35 (Thanks to @iemadk)

### 2.4.4
* Fix #30 and #31

### 2.4.3
* Fix relative path setting in Windows devices

### 2.4.2
* CHANGELOG.md

### 2.4.1
* Fix router setting

### 2.4.0
* 'autoOpenOnReload' option added
* 'openFileInBrowser' command added

### 2.3.0
* TypeScript Port
* 'Reload Server' option
* Auto open current file in browser

### 2.2.1
* Fixed "auto launch browser" option in Mac devices (#21). Now Safari is supported.

### 2.2.0
* The path of the PHP executable can be configured
* Error details are shown in a message (Only server errors)

### 2.1.1
* Error details are shown in a message

### 2.1.0
* Custom router script option added

### 2.0.1
* Browser is opened every time server is started
* Settings' changes are applied without restart the VScode editor

### 2.0.0
* **Windows console output fixed**
* IP option added
* RelativeUrl option removed (Now is "relativePath");
* Microsoft edge browser added

### 1.1.0
Code rewritten (almost):
* Windows support.
* Auto open localhost in browser (optional).
* Added context menu commands.
* Fixed problem with relative url.

### 1.0.0
Initial release of PHP Server