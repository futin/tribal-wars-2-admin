// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules

/* GET */

export const getAllSchedulers = ({ models }) => models.Scheduler.find()

export const getScheduler = ({ models, id }) => models.Scheduler.findById(id)

/* SET */

export const setScheduler = async ({ models, methods, payload }) => {
  const createdAt = moment.utc().toDate()
  const { accountId } = payload
  console.log(payload)
  const account = await methods.getAccount({ models, id: accountId })
  if (!account) return

  const scheduler = {
    createdAt,
    ...payload
  }

  return models.Scheduler.create(scheduler)
}

/* DELETE */

export const deleteScheduler = async ({ models, id }) => {
  const { deletedCount } = await models.Scheduler.deleteById(id)
  return !!deletedCount
}

export const deleteAllSchedulers = async ({ models }) => {
  const { deletedCount } = await models.Scheduler.deleteMany()
  return !!deletedCount
}
