// node core modules
import fs from 'fs'
import path from 'path'

// 3rd party modules
import mongoose from 'mongoose'
import _ from 'lodash'

// local modules
import { WS_DEFAULT_NUMBER } from '#global-constants'

export const isObject = o => o != null && typeof o === 'object'

let id = 1
export const staticData = () => ({
  data: { headers: { traveltimes: [['browser_send', new Date().getTime()]] } },
  id: id++
})

export const buildMessage = data => `42${JSON.stringify(['msg', _.merge(data, staticData())])}`

export const parseMessage = message => {
  if (!message.startsWith(WS_DEFAULT_NUMBER)) return
  try {
    const [, data] = JSON.parse(message.replace(WS_DEFAULT_NUMBER, ''))
    return data
  } catch (err) {
    console.error(err)
  }
}

export const roundRandomWithRange = ({ min = 1, max = 3 }) => Math.floor(Math.random() * (max - min) + min)

/**
 * This helper method is responsible for including all files from a certain directory. Exception file is always
 * an "index.js" since 99% of the time is the one making this call. If the files are not exported as default,
 * please provide loadDefault: false.
 *
 * For example, if you call: includeAllFiles({ pathToDirectory: /hooks/statisticHistory }), it will automatically load
 * all files from that hooks directory
 *
 * @param {String} pathToDirectory        Directory path relative to this utils file
 * @param {String} [exceptionFile]        Provide a file name (or RegEx) that should be ignored
 * @param {Boolean} [loadDefault]         If the required file(s) default should be required
 * @param {Boolean} [reduceToObjects]     If the required file(s) should be reduced to objects
 * @param {Boolean} [applyMerge]          If the required file(s) should be reduced to objects with merging algorithm
 * @returns {*[]}
 */
export const includeAllFiles = ({ pathToDirectory, exceptionFiles = [], loadDefault = true, reduceToObjects, applyMerge }) => {
  exceptionFiles = ['index.js'].concat(exceptionFiles)

  const listOfFiles = fs
    .readdirSync(pathToDirectory)
    .filter(file => !exceptionFiles.includes(file))
    .map(filename => loadDefault ? require(path.join(pathToDirectory, filename)).default : require(path.join(pathToDirectory, filename))
    )

  if (reduceToObjects) return listOfFiles.reduce((result, methods) => ({ ...result, ...methods }), {})
  if (applyMerge) return listOfFiles.reduce((result, methods) => _.merge(result, methods), {})
  return listOfFiles
}

export const setRandomInterval = (intervalFunction, timeoutConfig) => {
  let timeout
  const internalInterval = () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      intervalFunction()
      internalInterval()
    }, roundRandomWithRange(timeoutConfig) * 1000)
  }

  internalInterval()
}

export const ing = promise => promise
  .then(result => [null, result])
  .catch(error => [error])

export const toCamelCase = word =>
  word
    .toString()
    .split('_')
    .reduce((result, wordPart) =>
      result + wordPart.charAt(0).toUpperCase() + wordPart.slice(1))

export const toCamelCaseRecursive = (obj, keysToIgnore = {}) => {
  if (typeof obj === 'string') return toCamelCase(obj)
  if (!isObject(obj)) return obj

  return _.reduce(obj, (result, value, key) => {
    key = toCamelCase(key)
    value = keysToIgnore[key] ? value : toCamelCaseRecursive(value, keysToIgnore)
    return { ...result, [key]: value }
  }, {})
}

export const toMongoId = id => mongoose.Types.ObjectId(id)
