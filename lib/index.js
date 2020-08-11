// node core modules

// 3rd party modules
const WebSocket = require('ws')
const { delay } = require('promises-to-retry')
const _ = require('lodash')

// local modules
const { SOCKET_URL, SOCKET_OPTS, DEFAULT_CONFIG, VALID_TW_MODES } = require('./constants')
const prepareSenders = require('./senders')
const socketEventHandlers = require('./socket-event-handlers')

const tribalWarsAdmin = async ({ config, mode }) => {
  if (!mode || !VALID_TW_MODES.includes(mode)) {
    throw new Error('Mode is invalid or missing')
  }

  console.log(config)
  config = _.merge({}, DEFAULT_CONFIG, config)

  const ws = new WebSocket(SOCKET_URL, SOCKET_OPTS)
  const senders = prepareSenders(ws)

  socketEventHandlers({ ws, senders, config, mode })
  // wait for ws to setup
  await delay(500)

  // kick-in auth
  senders.sendAuthData(config.auth)

  // wait for authentication to finish
  await delay(1000)
  senders.sendGetCharacterInfo()
}

module.exports = tribalWarsAdmin
