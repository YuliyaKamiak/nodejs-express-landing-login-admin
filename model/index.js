const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync') // for work with data.json
const path = require('path')

const adapter = new FileSync(path.resolve(__dirname, '..', 'data.json'))
const db = low(adapter)

module.exports = db
