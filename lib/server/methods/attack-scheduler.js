// node core modules
import EventEmitter from 'events'

// 3rd party modules
import moment from 'moment-timezone'
import _ from 'lodash'
import transform from 'oniyi-object-transform'

// local modules
import tribalWarsExecutors from '@tw-executors'
import { ATTACK_SCHEDULER_CALCULATION_MODE } from '@global-constants'
import { transformAttackScheduler } from './utils'
import { utils } from '../mongodb'

/* GETTERS */
const calculateAttackLaunchTimes = ({ config }) => {
  const emitter = new EventEmitter()
  tribalWarsExecutors({ config, mode: ATTACK_SCHEDULER_CALCULATION_MODE, emitter })

  return new Promise((resolve) => {
    emitter.once('close', () => resolve({}))
    emitter.once('data', data => resolve(transformAttackScheduler(data)))
  })
}

const getScheduledAttacks = ({ models, ...filter }) => {
  const selector = transform({
    src: filter,
    pick: ['chainId', 'name'],
    map: {
      id: '_id'
    },
    parse: {
      _id: id => id && utils.toMongoId(id),
      chainId: id => id && utils.toMongoId(id),
      name: name => name && new RegExp(`${name}`, 'i')
    },
    ignoreUndefined: true
  })

  return models.AttackScheduler.find(selector)
}

/* SETTERS */
const setAttackScheduler = ({ models, config }) => {
  const emitter = new EventEmitter()
  const { presetConfig } = config

  tribalWarsExecutors({ config, mode: ATTACK_SCHEDULER_CALCULATION_MODE, emitter })

  return new Promise((resolve) => {
    emitter.once('close', () => resolve({}))
    emitter.once('data', async data => {
      data.createdAt = new Date()
      data.chainId = utils.toMongoId()
      data.presetConfig = presetConfig

      const { targets } = data || {}
      if (!targets || !targets.length) {
        console.log('targets not found')
        return resolve()
      }
      const attacksToSchedule = targets.map(target =>
        models.AttackScheduler.create({
          target,
          ..._.omit(data, ['targets']),
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
  getScheduledAttacks,
  // SET
  setAttackScheduler,
  // DELETE
  deleteChainedAttackSchedulers
}
