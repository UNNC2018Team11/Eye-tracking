'use strict'

import {
    app,
    protocol,
    BrowserWindow,
    Menu,
    MenuItem,
    ipcMain,
    dialog,
    nativeImage,
} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import FS from 'fs'
import store from './store'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } },
])

async function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        // show: false,
        backgroundColor: '#FFF',
        height: 1080,
        width: 1920,
        // minHeight: 600,
        // maxHeight: 2160,
        // minWidth: 800,
        // maxWidth: 3840,
        useContentSize: true,
        resizable: true,
        title: 'Eye Tracking for Simulation Assessment',
        // frame: false,
        // titleBarStyle: 'hidden',
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            enableRemoteModule: true
        },
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        // if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS)
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}

// Example of usage of Vuex Store from the main process
// Results of action will be automatically passed to all renderer processes
setInterval(() => {
    store.dispatch('decrement')
}, 5000)

//////////////////////////////////////////////////////////////////////////////////

ipcMain.on('run', (event) => {
    sendToPython()
    event.reply('success')
})

async function sendToPython() {
    // var cp = require('child_process')
    // const path = require('path')
    // const filePath = path.join(process.env.BASE_URL, 'calc.py')
    // cp.spawn('python', [filePath])

    const { PythonShell } = require('python-shell')
    // const path = require('path')

    // const filePath = path.resolve(process.env.BASE_URL)

    const options = {
      mode: 'text', // 'json', 'binary'
      pythonOptions: ['-u'],
      scriptPath: 'public/',
    }

    PythonShell.run('calc.py', options, (err) => {
      if (err) throw err
      console.log('finished')
      // results is an array consisting of messages collected during execution
      // console.log('results: ', results);
      // this.result = results[0];
    })

    // exchange data between node and python ////////////////////

    // const pyshell = new PythonShell('my_script.py');

    // // sends a message to the Python script via stdin
    // pyshell.send('hello');

    // pyshell.on('message', (message) => {
    //   // received a message sent from the Python script (a simple "print" statement)
    //   console.log(message);
    // });

    // // end the input stream and allow the process to exit
    // pyshell.end((err, code, signal) => {
    //   if (err) throw err;
    //   console.log(`The exit code was: ${code}`);
    //   console.log(`The exit signal was: ${signal}`);
    //   console.log('finished');
    // });

    // ////////////////////////////////////////////////////////////
  }