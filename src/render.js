const silkymark = require('silkymark')
const parse = silkymark.parse;
const { dialog, BrowserWindow } = require('@electron/remote')
const remote = require('@electron/remote')
var inputtext = ''
var mode = 'write'
var curfile = ''
var curfiledir = ''
const fs = require('fs');
const { app } = require('electron/main');
const { ipcRenderer } = require('electron')

const convertCSSToJSON = (str) => {
    var csslist = str.split('\n')
    var newlist = [];
    csslist.forEach(line => {
        newlist.push({name: line.split(': ')[0], value: line.split(': ')[1]})
    })
    return JSON.stringify(newlist);
}

var remoteapp = require('@electron/remote').app

try {
    fs.readFileSync(remoteapp.getPath('appData') + '/preferences.json', 'utf8')
} catch {
    fs.writeFileSync(remoteapp.getPath('appData') + '/preferences.json', convertCSSToJSON(`--editor-background: rgb(0, 0, 0);
    --viewbar-bg: rgb(31, 31, 31);
    --editor-text-bg: rgb(50, 50, 50);
    --file-explorer-background: rgb(82, 82, 82);
    --file-explorer-file-background: rgb(50, 50, 50);`))
}
finally {
    JSON.parse(fs.readFileSync(remoteapp.getPath('appData') + '/preferences.json', 'utf8')).forEach(thing => {
        let root = document.documentElement
        root.style.setProperty(thing.name, thing.value)
    })
}

const openPreferences = () => {
    console.log('dsfasef')
    ipcRenderer.send('openPreferences', '')
    
    
}
const preferences = () => {
    JSON.parse(fs.readFileSync(remoteapp.getPath('appData') + '/preferences.json', 'utf8')).forEach(thing => {
        document.querySelector(`.${thing.name}`).value = thing.value
    })
}

document.querySelector('#preferences').addEventListener('click', openPreferences)

document.querySelector('#textinput')?.addEventListener('input', () => {

    inputtext = document.querySelector('#textinput')?.value ?? ''
    if (curfile !== '') document.title = `quarX - *${curfile}`
    document.querySelector('#file-explorer').innerHTML = ''
    document.querySelector('#file-explorer').innerHTML = `<div class="file">*${curfile}</div>`
})

document.querySelector('#readwrite').addEventListener('change', () => {
    document.querySelector('#modetext').innerHTML = document.querySelector('#readwrite').checked ? 'Mode: View&nbsp;' : 'Mode: Write'
    mode = document.querySelector('#readwrite').checked ? 'view' : 'write'
    if (mode === 'view') {
        inputtext = document.querySelector('#textinput')?.value ?? ''
        document.querySelector('#textinput.other').style = 'display: none;'
        document.querySelector('#textinput.document').style = ''
        document.querySelector('#textinput.document').innerHTML = parse(inputtext)
    }
    if (mode === 'write') {
        document.querySelector('#textinput.other').style = ''
        document.querySelector('#textinput.document').style = 'display: none'
        document.querySelector('#textinput.other').value = inputtext
    }
})

const reload = () => {
    remote.getCurrentWindow().webContents.reloadIgnoringCache();
}


const openFile = () => {
    // here the args will be the fileObj.filePaths array 
    // do whatever you need to do with it 
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Quark File', extensions: ['qk'] }
        ]
    }).then(fileObj => {
        args = fileObj.filePaths;
        inputtext = fs.readFileSync(args[0], 'utf8').toString()
        document.querySelector('#textinput.other').style = ''
        document.querySelector('#textinput.document').style = 'display: none'
        document.querySelector('#textinput.other').value = inputtext
        curfile = args[0].replace(/^.*[\\\/]/, '')
        curfiledir = args[0]
        document.title = `quarX - ${curfile}`
        document.querySelector('#file-explorer').innerHTML = ''
        document.querySelector('#file-explorer').innerHTML = `<div class="file">${curfile}</div>`
    })

}
const openSingleFolder = (fileObj) => {
    
        fs.readdir(fileObj.filePaths[0], (err, files) => {
            if (err) {
                throw err;
            }
        
            // files object contains all files names
            // log them on console
            document.querySelector('#file-explorer').innerHTML = ''
            files.forEach(file => {
                inputtext = fs.readFileSync(file, 'utf8').toString()
                document.querySelector('#textinput.other').style = ''
                document.querySelector('#textinput.document').style = 'display: none'
                document.querySelector('#textinput.other').value = inputtext
                curfile = file.replace(/^.*[\\\/]/, '')
                if (file === curfile) {
                    curfiledir = file
                    document.title = `quarX - ${curfile}`
                
                    document.querySelector('#file-explorer').innerHTML += `<div class="file">${curfile}</div>`
                    console.log(file);
                } else {
                    openSingleFolder(fileObj.filePaths[0] + file)
                }
                
            });
        });
    
}
const openFolder = async () => {
    `<button type="button" class="collapsible file">Folder</button>
    <div class="content">
      fsdgsfgsdfggdf
    </div>`
    dialog.showOpenDialog({ properties: ['openDirectory'] }).then (fileObj => {
    openSingleFolder(fileObj)
})
}   
const saveFile = () => {
    if (curfile) {
        document.title = `quarX - ${curfile}`
        fs.writeFileSync(curfiledir, inputtext)
        document.querySelector('#file-explorer').innerHTML = ''
        document.querySelector('#file-explorer').innerHTML = `<div class="file">${curfile}</div>`
    }
}



document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        // Prevent the Save dialog to open
        e.preventDefault();
        // Place your code here
        saveFile()
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        // Prevent the Save dialog to open
        e.preventDefault();
        // Place your code here
        openFile()
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'o') {
        e.preventDefault();
        openFolder();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        // Prevent the Save dialog to open
        e.preventDefault();
        // Place your code here
        reload()
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        // Prevent the Save dialog to open
        e.preventDefault();
        // Place your code here
        document.querySelector('#readwrite').checked = document.querySelector('#readwrite').checked ? false : true
        document.querySelector('#modetext').innerHTML = document.querySelector('#readwrite').checked ? 'Mode: View&nbsp;' : 'Mode: Write'
        mode = document.querySelector('#readwrite').checked ? 'view' : 'write'
        if (mode === 'view') {
            inputtext = document.querySelector('#textinput')?.value ?? ''
            document.querySelector('#textinput.other').style = 'display: none;'
            document.querySelector('#textinput.document').style = ''
            document.querySelector('#textinput.document').innerHTML = parse(inputtext)
        }
        if (mode === 'write') {
            
            document.querySelector('#textinput.other').style = ''
            document.querySelector('#textinput.document').style = 'display: none'
            document.querySelector('#textinput.other').value = inputtext
            document.querySelector('#textinput.other').focus()

        }
    }
});



const close = async () => {
    var window = remote.getCurrentWindow();
    window.close()
}
const maximise = () => {
    var window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
        window.maximize();
    } else {
        window.unmaximize();
    }
}
const minimise = () => {
    remote.getCurrentWindow().minimize();
}

document.querySelector('#closebtn').addEventListener('click', close)

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}
