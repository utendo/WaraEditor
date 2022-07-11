const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');

let win;

try {
	require('electron-reloader')(module, {
        ignore: [
            'tools',
            'python',
            'undefined'
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
    win.webContents.send('get-app-path', path.resolve('.'));
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
            {
                label: 'Change Mii hash',
		enabled: false,
                click: function() {
                    // It changes the Mii hash (<mii> in the xml)
                }
            },
            {
                label: 'Change Yeah! count',
		enabled: false,
                click: function() {
                    // Changes the count of Yeah's (<empathy_count> in the xml)
                }
            },
            {
                label: 'Change Mii face URL',
		enabled: false,
                click: function() {
                    // Changes the mii face (<mii_face_url> in the xml)
                }
            },
            {
                label: 'Change Reply count',
		enabled: false,
                click: function() {
                    // Changes the reply's count (<reply_count> in the xml)
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
            {
                label: 'Has Shop page',
		enabled: false,
                click: function() {
                    // tells if it has eshop page (1 for yes and 0 for no) (<has_shop_page> in the xml)
                }
            },
            {
                label: 'Change Title ID',
		enabled: false,
                click: function() {
                    // ask me on discord cause theres multiple in the xml
                }
            },
            {
                label: 'Change Community ID',
		enabled: false,
                click: function() {
                    // same, ask me on discord cause theres multiple in the xml
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
