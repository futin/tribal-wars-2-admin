// node core modules

// 3rd party modules
const _ = require('lodash')

// local modules
const { WS_DEFAULT_NUMBER } = require('./constants')

let id = 1
const staticData = () => ({
  data: { headers: { traveltimes: [['browser_send', new Date().getTime()]] } },
  id: id++
})

const buildMessage = data => `42${JSON.stringify(['msg', _.merge(data, staticData())])}`

const parseMessage = message => {
  if (!message.startsWith(WS_DEFAULT_NUMBER)) return
  try {
    const [, data] = JSON.parse(message.replace(WS_DEFAULT_NUMBER, ''))
    return data
  } catch (err) {
    console.error(err)
  }
}

const roundRandomWithRange = ({ min = 1, randomize = 3 }) => _.round(min + Math.random() * randomize, 0)

module.exports = {
  buildMessage,
  parseMessage,
  roundRandomWithRange
}
