const fs = require('fs-extra')
const path = require('path')
const toml = require('toml')
const merge = require('lodash.merge')

const langDir = path.join(__dirname, '..', 'lang')

let lang
let currentLanguage = 'en_US'

function getLanguageFilePath(id){
    return path.join(langDir, `${id}.toml`)
}

exports.loadLanguage = function(id){
    lang = merge(lang || {}, toml.parse(fs.readFileSync(getLanguageFilePath(id), 'utf-8')) || {})
}

exports.getCurrentLanguage = function(){
    return currentLanguage
}

exports.getAvailableLanguages = function(){
    return fs.readdirSync(langDir)
        .filter((file) => file.endsWith('.toml') && !file.startsWith('_'))
        .map((file) => {
            const id = path.basename(file, '.toml')
            const fileData = toml.parse(fs.readFileSync(path.join(langDir, file), 'utf-8'))
            return {
                id,
                displayName: fileData.meta?.displayName || id
            }
        })
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
}

exports.query = function(id, placeHolders){
    let query = id.split('.')
    let res = lang
    for(let q of query){
        res = res[q]
    }
    let text = res === lang ? '' : res
    if (placeHolders) {
        Object.entries(placeHolders).forEach(([key, value]) => {
            text = text.replace(`{${key}}`, value)
        })
    }
    return text
}

exports.queryJS = function(id, placeHolders){
    return exports.query(`js.${id}`, placeHolders)
}

exports.queryEJS = function(id, placeHolders){
    return exports.query(`ejs.${id}`, placeHolders)
}

exports.setupLanguage = function(id = 'en_US'){
    lang = {}

    // Load Language Files
    exports.loadLanguage('en_US')

    const selectedLanguage = id !== '_custom' && fs.existsSync(getLanguageFilePath(id))
        ? id
        : 'en_US'

    if(selectedLanguage !== 'en_US'){
        exports.loadLanguage(selectedLanguage)
    }

    // Load Custom Language File for Launcher Customizer
    exports.loadLanguage('_custom')

    currentLanguage = selectedLanguage
    return currentLanguage
}
