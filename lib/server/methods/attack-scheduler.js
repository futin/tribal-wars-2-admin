// node core modules
import EventEmitter from 'events'

// 3rd party modules
import moment from 'moment-timezone'
import _ from 'lodash'

// local modules
import tribalWarsAdmin from '../../tw'
import { ATTACK_SCHEDULER_CALCULATION_MODE } from '../../constants'
import { transformAttackScheduler } from './utils'
import { utils } from '../mongodb'

/* GETTERS */
const calculateAttackLaunchTimes = ({ config }) => {
  const emitter = new EventEmitter()
  tribalWarsAdmin({ config, mode: ATTACK_SCHEDULER_CALCULATION_MODE, emitter })

  return new Promise((resolve) => {
    emitter.on('close', () => resolve({}))
    emitter.on('data', data => resolve(transformAttackScheduler(data)))
  })
}

/* SETTERS */
const setAttackScheduler = ({ models, config }) => {
  const emitter = new EventEmitter()
  const { presetConfig } = config

  tribalWarsAdmin({ config, mode: ATTACK_SCHEDULER_CALCULATION_MODE, emitter })

  return new Promise((resolve) => {
    emitter.on('close', () => resolve({}))
    emitter.on('data', async data => {
      const createdAt = new Date()
      data.chainId = utils.toMongoId()

      const { targets } = data || {}
      if (!targets || !targets.length) {
        console.log('targets not found')
        return resolve()
      }
      const attacksToSchedule = targets.map(target =>
        models.AttackScheduler.create({
          ..._.omit(data, ['targets']),
          target,
          presetConfig,
          createdAt,
          executeAt: moment.utc(target.launchTime).toDate()
        })
      )

      await Promise.all(attacksToSchedule)

      resolve(transformAttackScheduler(data))
    })
  })
}

// DELETE
const deleteChainedAttackSchedulers = async ({ chainId, models }) => {
  const { deletedCount } = await models.AttackScheduler.deleteMany({ chainId: utils.toMongoId(chainId) })
  return !!deletedCount
}

export {
  // GET
  calculateAttackLaunchTimes,
  // SET
  setAttackScheduler,
  // DELETE
  deleteChainedAttackSchedulers
}
