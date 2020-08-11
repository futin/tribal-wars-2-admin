// node core modules

// 3rd party modules

// local modules
const { parseMessage } = require('./utils')
const { attackExecutors, recruitmentExecutors } = require('./executors')

const lineSeparator = '\n=====================================================================================\n'
const socketEventHandlers = ({ ws, senders, config, mode }) => {
  let executors
  if (mode === 'attack') {
    config = { ...config, ...config.attack, isAttack: true }
    executors = attackExecutors({ senders })
  }
  if (mode === 'recruit') {
    config = { ...config, ...config.recruit, isRecruit: true }
    executors = recruitmentExecutors({ senders })
  }

  if (!executors) return console.log('Executor not found')

  ws.on('open', () => console.log(`${lineSeparator}CONNECTED at ${new Date()}`))
  ws.on('close', () => console.log(`DISCONNECTED at ${new Date()}${lineSeparator}`))
  ws.on('message', message => {
    const response = parseMessage(message)
    if (!response || !response.type) return
    const executor = executors[response.type]
    executor && executor({ response, config })
  })
  ws.on('error', error => console.log('on error', error))
}

module.exports = socketEventHandlers
