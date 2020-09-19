// node core modules
import EventEmitter from 'events'

// 3rd party modules

// local modules
import tribalWarsAdmin from '../../tw'
import { ATTACK_SCHEDULER_MODE } from '../../constants'
import { transformAttackScheduler } from './utils'

/* GETTERS */
const calculateAttackLaunchTimes = ({ config }) => {
  const emitter = new EventEmitter()
  tribalWarsAdmin({ config, mode: ATTACK_SCHEDULER_MODE, emitter })

  return new Promise((resolve) => {
    emitter.on('close', () => resolve({}))
    emitter.on('data', data => resolve(transformAttackScheduler(data)))
  })
}

/* SETTERS */
const setAttackScheduler = ({ models, config }) => {
  const emitter = new EventEmitter()
  const { presetConfigs = [] } = config

  tribalWarsAdmin({ config, mode: ATTACK_SCHEDULER_MODE, emitter })

  return new Promise((resolve) => {
    emitter.on('close', () => resolve({}))
    emitter.on('data', async data => {
      const createdAt = new Date()

      const attackSchedulerData = {
        ...data,
        presetConfigs,
        createdAt
      }

      const attackScheduler = await models.AttackScheduler.create(attackSchedulerData)
      resolve(transformAttackScheduler(attackScheduler.toJSON()))
    })
  })
}

export {
  // GET
  calculateAttackLaunchTimes,
  // SET
  setAttackScheduler
}
