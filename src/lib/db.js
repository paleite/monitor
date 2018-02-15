import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

/** @type {FileSync} */
const adapter = new FileSync('.cache/db.json')
export default low(adapter)
