// node core modules

// 3rd party modules
import WebSocket from 'ws'
import { delay } from 'promises-to-retry'
import _ from 'lodash'

// local modules
import prepareSenders from './senders'
import socketEventHandlers from './socket-event-handlers'
import { SOCKET_URL, SOCKET_OPTS, DEFAULT_CONFIG, VALID_TW_MODES, ATTACK_MODE, RECRUIT_MODE } from '../constants'
import { attackExecutors, recruitmentExecutors } from './executors'

const tribalWarsAdmin = async ({ config, mode }) => {
  if (!mode || !VALID_TW_MODES.includes(mode)) {
    throw new Error('Mode is invalid or missing')
  }

  const ws = new WebSocket(SOCKET_URL, SOCKET_OPTS)
  const senders = prepareSenders(ws)

  let executors
  if (mode === ATTACK_MODE) {
    config = _.merge({ isAttack: true }, DEFAULT_CONFIG.attack, config)
    executors = attackExecutors({ senders })
  }
  if (mode === RECRUIT_MODE) {
    config = _.merge({ isRecruit: true }, DEFAULT_CONFIG.recruit, config)
    executors = recruitmentExecutors({ senders })
  }
  if (!executors) return senders.close('Executor not found')

  socketEventHandlers({ ws, executors, config })

  // wait for ws to setup
  await delay(4000)

  // kick-in auth
  senders.sendAuthData(config.auth)

  // wait for authentication to finish
  await delay(1000)
  senders.sendGetCharacterInfo()
}

export default tribalWarsAdmin
