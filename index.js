const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');

let win;

try {
	require('electron-reloader')(module, {
        ignore: [
            'tools',
            'python'
        ]
    });
} catch {}

function createWindow () {
  win = new BrowserWindow({
    width: 1300,
    height: 800,
    title: "WaraWara Plaza Editor v2",
    icon: "./build/icon.png",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(function() {
    createWindow();
})

const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New',
                click: function() {
                    win.webContents.send('open-file', __dirname + '/default.xml')
                },
                accelerator: 'CmdOrCtrl+N'
            },
            {
                label: 'Open',
                click: function() {
                    dialog.showOpenDialog(win, {
                        properties: ['openFile'],
                        filters: [
                            {name: 'WaraWara Plaza XML file', extensions: ['xml']},
                            {name: 'Text document', extensions: ['txt']},
                            {name: 'All Files', extensions: ['*']}
                        ],
                        title: 'Open WaraWara Plaza XML file',
                        multiSelections: false,
                        buttonLabel: 'Edit'
                    }).then(result => {
                        if(!result.canceled) {
                            win.webContents.send('open-file', result.filePaths[0])
                        }
                    }).catch(err => {
                        console.log(err)
                    })
                },
                accelerator: 'CmdOrCtrl+O'
            },
            {
                label: 'Save as',
                accelerator: 'CmdOrCtrl+S',
                click: function() {
                    dialog.showSaveDialog(win, {
                        title: 'Save WaraWara Plaza XML file',
                        buttonLabel: 'Save',
                        filters: [
                            {name: 'WaraWara Plaza XML file', extensions: ['xml']},
                            {name: 'Text document', extensions: ['txt']},
                            {name: 'All Files', extensions: ['*']}
                        ]
                    }).then(result => {
                        if(!result.canceled) {
                            win.webContents.send('save-file', result.filePath)
                        }
                    }).catch(err => {
                        console.log(err)
                    });
                }
            }
        ]
    },
    {
        label: 'Post',
        submenu: [
            {
                label: 'Delete',
                accelerator: 'Delete',
                click: function() {
                    win.webContents.send('delete-post')
                }
            },
            {
                label: 'Duplicate',
                accelerator: 'CmdOrCtrl+D',
                click: function() {
                    win.webContents.send('duplicate-post')
                }
            },
        ]
    },
    {
        label: 'Topic',
        submenu: [
            {
                label: 'Toggle Recommended',
                click: function() {
                    win.webContents.send('toggle-recommended')
                }
            },
        ]
    },
    {
        label: 'Developer',
        submenu: [
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
        ]
    }
]
  
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on('open-icon', (event, file) => {
    dialog.showOpenDialog(win, {
        properties: ['openFile'],
        filters: [
            {name: '128x128 Icon', extensions: ['tga']}
        ],
        title: 'Open WaraWara Plaza icon image',
        multiSelections: false,
        buttonLabel: 'Convert'
    }).then(result => {
        if(!result.canceled) {
            win.webContents.send('icon-updated', {
                file : result.filePaths[0],
                topic : file.topic
            })
        }
    }).catch(err => {
        console.log(err)
    })
});

ipcMain.on('open-painting', (event, file) => {
    dialog.showOpenDialog(win, {
        properties: ['openFile'],
        filters: [
            {name: '320x120 Painting', extensions: ['tga']}
        ],
        title: 'Open WaraWara Plaza painting image',
        multiSelections: false,
        buttonLabel: 'Convert'
    }).then(result => {
        if(!result.canceled) {
            win.webContents.send('painting-updated', {
                file : result.filePaths[0],
                topic : file.topic,
                person : file.person
            })
        }
    }).catch(err => {
        console.log(err)
    })
});