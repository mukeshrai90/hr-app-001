
const path = require("path");
const { BrowserWindow, app } = require("electron");
const { createFileRoute, createURLRoute } = require('electron-router-dom')
const isDev = require('electron-is-dev');

exports.createWindow = () => {
	const fileRoute = createFileRoute( path.join(__dirname, '../../build/index.html'), "main")
	
	const serverURL = createURLRoute("http://localhost:3000", "main")

	//our window you can chanege the size  and other
	let mainWindow = new BrowserWindow({
	  show: true,
	  height: 800,
	  width: 400,
	  useContentSize: true,
	  // frame : false,
	  webPreferences: {
		preload: path.join(__dirname, "./preload.js"),
		nodeIntegration: true
	  },
	});

	isDev
		? mainWindow.loadURL(serverURL)
		: mainWindow.loadFile(...fileRoute)

	 if (1 || isDev) {
		mainWindow.webContents.openDevTools({ mode: 'detach' })
	 }
	 
	 return mainWindow;
};