import axios from 'axios'
import objectHash from 'object-hash'
import md5 from 'md5'
import {diff} from 'deep-object-diff'

/**
 * An "abstract" class which services can extend, to hook themselves up to the
 * framework.
 * @class
 * @classdesc A class to set the foundation for each monitoring service
 */
export default class Service {
  /**
   * Initializes the object and gives access to the database
   */
  constructor () {
    const name = this.constructor.name
    if (typeof this.check !== 'function') {
      throw Error(`${name} must override check()`)
    }

    /** @type {object} */
    this.db = arguments[0]
    this.db.defaults({services: []}).write()
    /** @type {LodashWrapper} */
    this.dbData = this.db.get('services').find({name})

    // Create a row if the service doesn't exist
    if (typeof this.dbData.value() === 'undefined') {
      this.db
        .get('services')
        .push({name})
        .write()
    }
    const {hash, hasChanged, data} = this.dbData.value()
    this.db._.merge(this, {hash, hasChanged, originalData: data})

    /** @type {function} */
    this.axios = axios
  }

  /**
   * Updates the database's object
   * @returns {undefined}
   */
  updateDB () {
    const updateObj = {
      hash: this.hash,
      hasChanged: this.hasChanged,
      data: this.data
    }
    if (this.hasChanged) {
      updateObj.diff = diff(this.originalData, this.data)
    }
    this.dbData.assign(updateObj).write()
  }

  /**
   * Resets the database's object and marks it as up-to-date
   * @returns {undefined}
   */
  reset () {
    this.dbData.assign({hasChanged: false}).write()
  }

  /**
   * A hash function with support for objects and strings
   * @private
   * @param {Object|string} input An object or string
   * @returns {string} The hash of the input
   */
  static _getHash (input) {
    const type = typeof input
    let hash = null

    if (type === 'object') {
      hash = objectHash(input)
    } else {
      hash = md5(input)
    }

    return hash
  }

  /**
   * @type {Object|string}
   */
  get data () {
    return this._data
  }

  /**
   * @param {Object|string} data An object or string
   * @returns {undefined}
   */
  set data (data) {
    let hash = Service._getHash(data)

    if (this.hash !== hash) {
      /** @type {string} */
      this.hash = hash
      /** @type {boolean} */
      this.hasChanged = true
    }

    /** @type {Object|string} */
    this._data = data
    this.updateDB()
  }
}
