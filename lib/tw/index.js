// node core modules

// 3rd party modules
import WebSocket from 'ws'
import _ from 'lodash'

// local modules
import prepareSenders from './senders'
import socketEventHandlers from './socket-event-handlers'
import { SOCKET_URL, SOCKET_OPTS, DEFAULT_CONFIG, VALID_TW_MODES, ATTACK_MODE, ATTACK_SCHEDULER_MODE, RECRUIT_MODE, VILLAGES_DATA_MODE } from '../constants'
import { attackExecutors, attackSchedulerExecutors, recruitmentExecutors, villagesData } from './executors'

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
  if (mode === ATTACK_SCHEDULER_MODE) {
    config = _.merge({ isAttackScheduler: true }, DEFAULT_CONFIG.attackScheduler, config)
    executors = attackSchedulerExecutors({ senders })
  }
  if (mode === RECRUIT_MODE) {
    config = _.merge({ isRecruit: true }, DEFAULT_CONFIG.recruit, config)
    executors = recruitmentExecutors({ senders })
  }
  if (mode === VILLAGES_DATA_MODE) {
    config = _.merge({ isVillageDataInfo: true }, config)
    executors = villagesData({ senders })
  }
  if (!executors) return senders.close('Executor not found')

  socketEventHandlers({ ws, executors, config, senders })
}

export default tribalWarsAdmin
