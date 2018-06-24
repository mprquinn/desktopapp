const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain } = electron;

// SET ENV
process.env.NODE_ENV = "production";

let mainWindow;
let addWindow;

// listen  for the app to be ready
app.on("ready", () => {
  // create new window
  mainWindow = new BrowserWindow({});
  // load the html file into the window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "mainWindow.html"),
      protocol: "file:",
      slashes: true
    })
  );
  // close small windows if main window closed
  mainWindow.on("closed", () => {
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// this happens in the menu below
function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add Shopping List Item"
  });
  // load the html file into the window
  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "addWindow.html"),
      protocol: "file:",
      slashes: true
    })
  );
  // Garbage collection handle
  addWindow.on("close", () => {
    addWindow = null;
  });
}

// Catch item add (event, payload)
ipcMain.on("item:add", (e, item) => {
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add Item",
        accelerator: process.platform === "darwin" ? "Command+I" : "Ctrl+I",
        click() {
          createAddWindow();
        }
      },
      {
        label: "Clear Items",
        click() {
          mainWindow.webContents.send("item:clear");
        }
      },
      {
        label: "Quit",
        // aka hotkey, also check for the OS
        accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        }
      }
    ]
  }
];

// If Mac, add empty item to start of menu
if (process.platform === "darwin") {
  mainMenuTemplate.unshift({});
}

// Add developer tools if not in production
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Toggle Developer Tools",
        accelerator: process.platform === "darwin" ? "Command+T" : "Ctrl+T",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }, {
        role: "reload"
      }
    ]
  });
}
