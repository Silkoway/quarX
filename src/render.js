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

var selected = null;

const convertCSSToJSON = (str) => {
    var csslist = str.split('\n')
    var newlist = [];
    csslist.forEach(line => {
        newlist.push({ name: line.split(': ')[0], value: line.split(': ')[1] })
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

    if (curfile !== '') document.title = `quarX - *${curfile}`
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

const dree = require("dree");

function parseTree(tree, currentDir) {
    if (tree.type === "directory") {
        const name = tree.name;
        const result = [name];
        for (let child of tree.children) {
            parseTree(child, result);
        }
        result.push([]);

        if (currentDir === undefined) {
            return result;
        } else {
            currentDir.push(result);
        }
    }
    if (tree.type === 'file') {
        currentDir.push(tree.name)
    }
}
const openFolder = async () => {
    `<button type="button" class="collapsible file">Folder</button>
    <div class="content">
      fsdgsfgsdfggdf
    </div>`
    dialog.showOpenDialog({ properties: ['openDirectory'] }).then(fileObj => {
        const result = parseTree(dree.scan(fileObj.filePaths[0]))
        document.querySelector('#file-explorer').innerHTML = ''
        var layer = 0;
        function check(result, path) {
            var index = 0;
            const curlayer = layer;
            var end = ''
            result.forEach(file => {
                if (index === 0) {
                    end += `<button type="button" class="collapsible file" style="width: calc(20vw - ${2 + layer}rem); padding-left: ${layer + 1}rem;">${file} <span class="arrow"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-square" viewBox="0 0 16 16">
                    <path d="M3.626 6.832A.5.5 0 0 1 4 6h8a.5.5 0 0 1 .374.832l-4 4.5a.5.5 0 0 1-.748 0l-4-4.5z"/>
                    <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2z"/>
                  </svg></span></button><div class="content">`
                } else {
                    if (Array.isArray(file)) {
                        layer = curlayer + 1;
                        end += check(file, `${path}/${file}`)
                    } else {
                        end += `<div class="file" style="width: calc(20vw - ${3 + layer}rem); padding-left: ${layer + 2}rem;" filepath="${path}/${file}">${file}</div>`
                    }
                }
                index++;
            })
            end += "</div>"

            if (curlayer === 0) {
                document.querySelector('#file-explorer').innerHTML += end
            }   else {
                return end
            }
           

        }

        check(result, fileObj.filePaths[0])

        collapsible()

        document.querySelectorAll('.file:not(button)').forEach(element => {
            element.addEventListener('click', () => {
                if (element === selected) return;
                if (selected !== null) selected.classList = selected?.classList?.remove('selected')
                document.querySelector('#textinput.other').style = ''
                document.querySelector('#textinput.document').style = 'display: none'
                filepath = element.getAttribute('filepath')
                inputtext = fs.readFileSync(filepath, 'utf8')
                document.querySelector('#textinput.other').value = inputtext
                curfile = filepath.replace(/^.*[\\\/]/, '')
                curfiledir = filepath
                document.title = `quarX - ${curfile}`
                element?.classList.add("selected")
                selected = element
            })
        })

    })
}
const saveFile = () => {
    if (curfile) {
        document.title = `quarX - ${curfile}`
        fs.writeFileSync(curfiledir, inputtext)
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

function addToggle() {
    this.classList.toggle("active");
    if (this.classList.contains("active")) {
        this.children[0].innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-up-square" viewBox="0 0 16 16">
    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
    <path d="M3.544 10.705A.5.5 0 0 0 4 11h8a.5.5 0 0 0 .374-.832l-4-4.5a.5.5 0 0 0-.748 0l-4 4.5a.5.5 0 0 0-.082.537z"/>
  </svg>`
    } else {
        this.children[0].innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-square" viewBox="0 0 16 16">
        <path d="M3.626 6.832A.5.5 0 0 1 4 6h8a.5.5 0 0 1 .374.832l-4 4.5a.5.5 0 0 1-.748 0l-4-4.5z"/>
        <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2z"/>
      </svg>`
    }
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
}

function collapsible() {
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        coll[i].removeEventListener("click", addToggle);
        coll[i].addEventListener("click", addToggle);
    }
}

function tick() {
    
}




