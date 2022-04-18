const silkymark = require('silkymark')
const parse = silkymark.parse;
const { dialog } = require('@electron/remote')
var inputtext = ''
var mode = 'write'

document.querySelector('#textinput')?.addEventListener('input', () => {

    inputtext = document.querySelector('#textinput')?.value ?? ''
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
        
    }
})

