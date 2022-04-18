var remoteapp = require('@electron/remote')
const fs = require('fs')

const preferences = () => {
    JSON.parse(fs.readFileSync(remoteapp.getPath('appData') + '/preferences.json', 'utf8')).forEach(thing => {
        document.querySelector(`.${thing.name}`).value = thing.value
    })
}