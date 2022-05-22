// node core modules

// 3rd party modules
import _ from 'lodash'

// local modules
import { parseMessage } from '#global-utils'
import { AUTH_LOGIN_SUCCESS_TYPE_RECEIVE, AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE } from '#global-constants'
import { addSessionResponse, removeSession } from './sessions-handler.js'

const lineSeparator = '\n=====================================================================================\n'

const performLoginRequest = ({ auth, response, senders }) => {
  const { worldName } = auth
  const characters = _.get(response, 'data.characters', [])
  let character = characters[0]

  if (worldName) character = characters.find(character => character.world_name === worldName) || character
  const { character_id: characterId, world_id: worldId } = character

  return senders.sendAuthCharSelectData({ characterId, worldId })
}

const socketEventHandlers = (ws) => {
  // we can extract auth safely, since each session keeps its own auth
  const { auth } = ws.config

  ws.once('open', () => {
    console.log(`${lineSeparator}CONNECTED at ${new Date()}`)
    // on connect, make authentication
    ws.senders.sendAuthData(auth)
  })

  ws.once('close', () => {
    console.log(`DISCONNECTED at ${new Date()}${lineSeparator}`)
    removeSession(auth)
  })

  ws.once('error', error => {
    console.log('WS Error:', error)
    removeSession(auth)
  })

  ws.on('message', message => {
    const response = parseMessage(message.toString())
    if (!response || !response.type) return

    const { senders, executors, config } = ws

    // handle global login, should be executed only once per session
    if (response.type === AUTH_LOGIN_SUCCESS_TYPE_RECEIVE) {
      return performLoginRequest({ auth, response, senders })
    }

    // store response in the session in order to preserve executions of other requests
    if (response.type === AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE) {
      addSessionResponse({ auth, characterResponse: response })
    }

    const executor = executors[response.type]
    executor && executor({ response, config })
  })
}

export default socketEventHandlers
