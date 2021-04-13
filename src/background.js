'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import fs from 'fs'
import path from 'path'
import http from 'http'
import { execSync } from 'child_process'

if (process.platform === 'win32') {
  app.setAppUserModelId('com.unnc.grp')
}

// examine the environment
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: false, standard: true } },
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    // show: false,
    backgroundColor: '#FFF',
    // height: 1080,
    // width: 1920,
    // minHeight: 600,
    // maxHeight: 2160,
    // minWidth: 800,
    // maxWidth: 3840,
    // useContentSize: true,
    title: 'Eye Tracking for Simulation Assessment',
    frame: false,
    center: true,
    resizable: false,
    titleBarStyle: 'hidden',
    fullscreen: true,
    icon: path.join(__static, 'icon.png'),
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
      // if the counter and animation are frozen when the window is not activated
      backgroundThrottling: false,
      webSecurity: false,
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

let url
  if (isDevelopment) {
    url = path.join('./simulation/')
  } else {
    url = path.join('./resources/simulation/')
  }

execSync('javac Main.java', { cwd: url }, (err, stdout, stderr) => {
  if (err) {
    console.error(err)
  }
  console.log(stdout)
})

execSync('javac SimulationLauncher.java', { cwd: url }, (err, stdout, stderr) => {
  if (err) {
    console.error(err)
  }
  console.log(stdout)
})

execSync('javac PythonLauncher.java', { cwd: url }, (err, stdout, stderr) => {
  if (err) {
    console.error(err)
  }
  console.log(stdout)
})

// Example of usage of Vuex Store from the main process
// Results of action will be automatically passed to all renderer processes
// setInterval(() => {
//   store.dispatch('decrement')
// }, 5000)
 
/********************************************************************************/

// ipcMain.on('run', (event) => {
//   sendToPython()
//   event.reply('success')
// }) 

// event listener: play simulation
ipcMain.on('play', (event, source) => {
  playSimulation(event, source)
})

// event listener: download map file from the cloud
ipcMain.on('downloadMap', (event, url, fileName) => {
  downloadMapFile(event, url, fileName)
})

// event listener: load and visualize the map data
ipcMain.on('loadMap', (event, file) => {
  readMapFile(event, file)
})

// event listener: rename the map filename
ipcMain.on('rename', (event, name) => {
  renameFile(event, name)
})

// event listener: copy and send the map data
ipcMain.on('copyMap', (event, file) => {
  copyMapFile(event, file)
})

/**
 * download map file from the given url
 *
 * @param {*} event
 * @param {String} url
 * @param {String} fileName
 */
function downloadMapFile(event, url, fileName) {
  let filePath
  if (isDevelopment) {
    filePath = path.join('./simulation/', fileName + '.csv')
  } else {
    filePath = path.join('./resources/simulation/', fileName + '.csv')
  }

  if (fs.existsSync(filePath)) {
    console.log('File already exists')
  } else {
    // send http GET request
    http
      .get(url, (res) => {
        const { statusCode } = res
        let error
        // Any 2xx status code signals a successful response but
        // here we're only checking for 200.
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`)
        }
        if (error) {
          console.error(error.message)
          // Consume response data to free up memory
          res.resume()
          return
        }

        res.setEncoding('utf8')
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          fs.writeFileSync(filePath, data)
        })
      })
      .on('error', (e) => {
        console.log(`Got error: ${e.message}`)
        event.reply('error', 'Error occurred during downloading of map files')
      })

    // let stream = fs.createWriteStream(filePath)
    // request(url)
    //   .pipe(stream)
    //   .on('close', (err) => {
    //     console.log('文件下载完毕')
    //     event.reply('mapDownloaded' + fileName)
    //   })
  }
}

/**
 * execute the java file according to the given simulation name
 *
 * @param {*} event
 * @param {String} source the simulation to play
 */
function playSimulation(event, source, file) {
  let simulation
  switch (source) {
    case 'Air Defense':
      simulation = 'AirDefense'
      break

    case 'Billiard Balls':
      simulation = 'BilliardBalls'
      break

    case 'Cargo Unload':
      simulation = 'CargoUnload'
      break

    case 'City Square':
      simulation = 'CitySquare'
      break

    case 'Covid-19':
      simulation = 'Covid19'
      break

    case 'Gas Station':
      simulation = 'GasStation'
      break

    case 'Maze':
      simulation = 'Maze'
      break

    case 'Terrorist Attack On A City Square':
      simulation = 'TerroristAttackOnCitySquare'
      break

    case 'Three Body Problem':
      simulation = 'ThreeBodyProblem'
      break
  }

  let url
  if (isDevelopment) {
    url = path.join('./simulation/')
  } else {
    url = path.join('./resources/simulation/')
  }
  // const { execSync } = require('child_process')
  // execSync(simulation + '.bat', { cwd: url }, (err, stdout, stderr) => {
  //   if (err) {
  //     console.error(err)
  //     return
  //   }
  //   console.log(stdout)
  // })

  execSync('java Main ' + simulation, { cwd: url }, (err, stdout, stderr) => {
    if (err) {
      console.error(err)
      event.reply('success' + source)
      event.reply('error', 'Error occurred during execution of simulation code')
      return
    }
    console.log(stdout)
  })

  let filePath
  if (isDevelopment) {
    filePath = path.join('./simulation/', 'mark.csv')
  } else {
    filePath = path.join('./resources/simulation/', 'mark.csv')
  }

  if (!fs.existsSync(filePath)) {
    console.log('csv文件不存在')
    event.reply('success' + source, 0)
    event.reply('error', 'Score file cannot be found')
    return
  }

  // read calculated score
  let score = fs.readFileSync(filePath)

  renameFile('', file)

  event.reply('success' + source, score * 1)
  // event.returnValue = score * 1
}

/**
 * read data from a map file
 *
 * @param {*} event
 * @param {String} file map filename
 * @returns
 */
function readMapFile(event, file) {
  let filePath
  if (isDevelopment) {
    filePath = path.join('./simulation/', file + '.csv')
  } else {
    filePath = path.join('./resources/simulation/', file + '.csv')
  }

  if (!fs.existsSync(filePath)) {
    console.log('csv文件不存在')
    event.reply('mapLoaded' + file, [])
    event.reply('error', 'Map file cannot be found')
    return
  }

  let data = fs.readFileSync(filePath)

  // convert map data to a 2-D array
  let table = []
  data = data.toString()
  table = data.match(/\d+(.\d+)?/g)

  // rearrange the table for visualization (size: 24 x 10)
  let result = []
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 24; col++) {
      result.push([row, col, parseInt(table[(9 - row) * 24 + col + 1])])
    }
  }

  event.reply('mapLoaded' + file, result)
}

/**
 *
 * @param {*} event
 * @param {String} name map filename
 * @returns
 */
function renameFile(event, name) {
  let dir
  if (isDevelopment) {
    dir = path.resolve('./simulation/')
  } else {
    dir = path.resolve('./resources/simulation/')
  }

  let oldPath = path.join(dir, 'std.csv')
  let newPath = path.join(dir, name + 'STD' + '.csv')

  if (!fs.existsSync(oldPath)) {
    console.log('csv文件不存在') 
    ipcMain.emit('error', 'Necessary file cannot be found')
    // event.reply('error', 'Necessary file cannot be found')
    return
  }

  fs.renameSync(oldPath, newPath)

  oldPath = path.join(dir, 'count.csv')
  newPath = path.join(dir, name + '.csv')

  if (!fs.existsSync(oldPath)) {
    console.log('csv文件不存在')
    ipcMain.emit('error', 'Necessary file cannot be found')
    // event.reply('error', 'Necessary file cannot be found')
    return
  }

  fs.renameSync(oldPath, newPath)
  // event.returnValue = 'renamed' + name

  // fs.readdir(dir, (err, files) => {
  //   files.forEach((value) => {
  //     if (value == 'map.csv') {
  //       console.log(oldPath);
  //       fs.renameSync(oldPath, newPath)
  //     }
  //   })
  // })

  // fs.mkdirSync(newPath)
  // fs.openSync(newPath)
  // fs.readFile(oldPath, (err, data) => {
  //   if (err) {
  //     console.log(err.stack)
  //     return
  //   }

  //   fs.writeFileSync(newPath, data)
  //   fs.closeSync(newPath)
  // })
}

/**
 * return the data in specified map file
 *
 * @param {*} event
 * @param {String} file map filename
 */
function copyMapFile(event, file) {
  let filePath
  if (isDevelopment) {
    filePath = path.join('./simulation/', file + '.csv')
  } else {
    filePath = path.join('./resources/simulation/', file + '.csv')
  }
 
  if (!fs.existsSync(filePath)) {
    console.log('csv文件不存在')
    event.reply('error', 'Map file cannot be found')
    return
  } 

  // event.reply('mapCopied' + file, path.resolve(filePath))

  let data = fs.readFileSync(filePath)
  // encode data into base64 for uploading
  data = new Buffer(data).toString('base64')
  event.returnValue = data
}

function sendToPython() {
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
    scriptPath: './',
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
}




