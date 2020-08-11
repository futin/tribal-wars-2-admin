// node core modules

// 3rd party modules

// local modules
import { parseMessage } from './utils'
import { attackExecutors, recruitmentExecutors } from './executors'
import { ATTACK_MODE, RECRUIT_MODE } from './constants'

const lineSeparator = '\n=====================================================================================\n'
const socketEventHandlers = ({ ws, senders, config, mode }) => {
  let executors
  if (mode === ATTACK_MODE) {
    config = { ...config, isAttack: true }
    executors = attackExecutors({ senders })
  }
  if (mode === RECRUIT_MODE) {
    config = { ...config, isRecruit: true }
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
