// node core modules

// 3rd party modules

// local modules
import { parseMessage } from '@global-utils'

const lineSeparator = '\n=====================================================================================\n'
const socketEventHandlers = ({ ws, executors, config, senders, emitter }) => {
  ws.on('open', () => {
    console.log(`${lineSeparator}CONNECTED at ${new Date()}`)
    // on connect, make authentication
    senders.sendAuthData(config.auth)
  })
  ws.on('close', () => {
    console.log(`DISCONNECTED at ${new Date()}${lineSeparator}`)
    emitter && !emitter.hasData && emitter.emit('close')
  })
  ws.on('message', message => {
    const response = parseMessage(message)
    if (!response || !response.type) return
    const executor = executors[response.type]
    executor && executor({ response, config })
  })
  ws.on('error', error => {
    console.log('on error', error)
    emitter && !emitter.hasData && emitter.emit('close')
  })
}

export default socketEventHandlers
