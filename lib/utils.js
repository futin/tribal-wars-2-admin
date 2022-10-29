// node core modules
import { inspect } from 'util'
import crypto from 'crypto'

// 3rd party modules
import mongoose from 'mongoose'
import _ from 'lodash'

// local modules
import { WS_DEFAULT_NUMBER } from '#global-constants'
import methods from './server/methods/index.js'
import { models } from './server/mongodb/index.js'

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

export const deepLog = ({ label = '----', value, showHidden = true, depth = null }) => console.log(label, inspect(value, showHidden, depth))

export const textToHash = text => text && crypto.createHash('md4').update(text).digest('hex')

export const buildAuth = async ({ models, methods, accountId }) => {
  if (!accountId) return

  const account = await methods.getAccount({ models, id: accountId })
  if (!account) return

  const { userName, worldName, uniqueId } = account
  const token = process.env[uniqueId.toUpperCase()]
  console.log({
    uniqueId, token
  })
  if (!token) {
    console.log(`Token not available for ${uniqueId.toUpperCase()}`)
    return
  }

  return {
    token,
    worldName,
    name: userName
  }
}
