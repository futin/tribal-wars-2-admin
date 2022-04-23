// node core modules

// 3rd party modules
import moment from 'moment-timezone'
import transform from 'oniyi-object-transform'
import _ from 'lodash'

// local modules
import tribalWarsExecutors from '#tw-executors'
import { ATTACK_SCHEDULER_CALCULATION_MODE } from '#global-constants'
import { toMongoId } from '#global-utils'
import { setOneTimeListener } from '#custom-emitter'
import { transformAttackScheduler } from './utils.js'

/* GETTERS */

export const calculateAttackLaunchTimes = ({ config }) => {
  const id = toMongoId()
  tribalWarsExecutors({ config, mode: ATTACK_SCHEDULER_CALCULATION_MODE, emitterKey: id })

  return new Promise((resolve) => {
    setOneTimeListener({
      key: id,
      listener: async ({ isError, message, payload }) => {
        if (isError || !payload) {
          console.log('calculateAttackLaunchTimes():', message)
          return resolve(null)
        }

        return resolve(transformAttackScheduler(payload))
      }
    })
  })
}

export const getScheduledAttacks = ({ models, ...filter }) => {
  const selector = transform({
    src: filter,
    pick: ['chainId', 'name'],
    map: {
      id: '_id'
    },
    parse: {
      _id: id => id && toMongoId(id),
      chainId: id => id && toMongoId(id),
      name: name => name && new RegExp(`${name}`, 'i')
    },
    ignoreUndefined: true
  })

  return models.AttackScheduler.find(selector)
}

/* SETTERS */

export const setAttackScheduler = ({ models, config }) => {
  const id = toMongoId()
  tribalWarsExecutors({ config, mode: ATTACK_SCHEDULER_CALCULATION_MODE, emitterKey: id })

  const { presetConfig } = config

  return new Promise((resolve) => {
    setOneTimeListener({
      key: id,
      listener: async ({ isError, message, payload }) => {
        if (isError || !payload) {
          console.log('setAttackScheduler():', message)
          return resolve(null)
        }
        const data = Object.assign({}, payload)
        data.createdAt = new Date()
        data.chainId = toMongoId()
        data.presetConfig = presetConfig

        if (!data?.targets?.length) {
          console.log('targets not found')
          return resolve()
        }

        const attacksToSchedule = data.targets.map(target =>
          models.AttackScheduler.create({
            target,
            ..._.omit(data, ['targets']),
            executeAt: moment.utc(target.launchTime).toDate()
          })
        )

        await Promise.all(attacksToSchedule)

        return resolve(transformAttackScheduler(data))
      }
    })
  })
}

/* DELETE */

export const deleteChainedAttackSchedulers = async ({ chainId, models }) => {
  const { deletedCount } = await models.AttackScheduler.deleteMany({ chainId: toMongoId(chainId) })
  return !!deletedCount
}

export const deleteAllAttackSchedulers = async ({ models }) => {
  const { deletedCount } = await models.AttackScheduler.deleteMany()
  return !!deletedCount
}
