// node core modules

// 3rd party modules
import WebSocket from 'ws'
import _ from 'lodash'

// local modules
import {
  SOCKET_URL, SOCKET_OPTS, DEFAULT_CONFIG, VALID_TW_MODES, FARMING_MODE, BUILDING_UPGRADES_MODE, ATTACK_SCHEDULER_CALCULATION_MODE,
  ATTACK_SCHEDULER_MODE, RECRUIT_UNITS_MODE, RECRUIT_SPIES_MODE, VILLAGES_DATA_MODE, MOVE_UNITS_MODE,
  MASS_DONATION_MODE
} from '#global-constants'
import prepareSenders from './senders.js'
import socketEventHandlers from './socket-event-handlers.js'

import {
  farmingExecutors, attackSchedulerCalculationExecutors, attackSchedulerExecutors, buildingUpgradeExecutors,
  recruitmentUnitsExecutors, recruitmentSpiesExecutors, villagesDataExecutors, moveUnitsExecutors, massDonationExecutors
} from './executors/index.js'

const tribalWarsExecutors = async ({ config, mode, emitterKey }) => {
  if (!mode || !VALID_TW_MODES.includes(mode)) {
    throw new Error('Mode is invalid or missing')
  }

  const ws = new WebSocket(SOCKET_URL, SOCKET_OPTS)
  const senders = prepareSenders({ ws, mode })

  let executors
  if (mode === FARMING_MODE) {
    config = _.merge({ isFarming: true }, DEFAULT_CONFIG.farming, config)
    executors = farmingExecutors({ senders })
  }
  if (mode === BUILDING_UPGRADES_MODE) {
    config = _.merge({ isBuildingUpgrades: true }, DEFAULT_CONFIG.buildingUpgrades, config)
    executors = buildingUpgradeExecutors({ senders, emitterKey })
  }
  if (mode === ATTACK_SCHEDULER_CALCULATION_MODE) {
    config = _.merge({ isAttackSchedulerCalculation: true }, DEFAULT_CONFIG.attackScheduler, config)
    executors = attackSchedulerCalculationExecutors({ senders, emitterKey })
  }
  if (mode === ATTACK_SCHEDULER_MODE) {
    config = _.merge({ isAttackScheduler: true }, config)
    executors = attackSchedulerExecutors({ senders })
  }
  if (mode === RECRUIT_UNITS_MODE) {
    config = _.merge({ isUnitRecruit: true }, DEFAULT_CONFIG.recruit, config)
    executors = recruitmentUnitsExecutors({ senders, emitterKey })
  }
  if (mode === RECRUIT_SPIES_MODE) {
    config = _.merge({ isSpyRecruit: true }, DEFAULT_CONFIG.recruit, config)
    executors = recruitmentSpiesExecutors({ senders })
  }
  if (mode === VILLAGES_DATA_MODE) {
    config = _.merge({ isVillageDataInfo: true }, config)
    executors = villagesDataExecutors({ senders, emitterKey })
  }
  if (mode === MOVE_UNITS_MODE) {
    config = _.merge({ isMoveUnits: true }, config)
    executors = moveUnitsExecutors({ senders })
  }
  if (mode === MASS_DONATION_MODE) {
    config = _.merge({ isMassDonation: true }, config)
    executors = massDonationExecutors({ senders })
  }
  if (!executors) return senders.close('Executor not found')

  socketEventHandlers({ ws, executors, config, senders })
}

export default tribalWarsExecutors
