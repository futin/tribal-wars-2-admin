// node core modules

// 3rd party modules
import moment from 'moment-timezone'

// local modules

/* GET */

export const getAllAccounts = ({ models }) => models.Account.find()

export const getAccount = ({ models, id }) => models.Account.findById(id)

/* SET */

export const setAccount = ({ models, payload }) => {
  const createdAt = moment.utc().toDate()
  const { userName, worldName } = payload
  const uniqueId = `${userName}_${worldName}`
    .toLowerCase()
    .replace(/[^\x20-\x7E]/g, '')
    .split(' ')
    .join('_')

  const account = {
    createdAt,
    uniqueId,
    ...payload
  }

  return models.Account.create(account)
}

/* DELETE */

export const deleteAccount = async ({ models, id }) => {
  const { deletedCount } = await models.Account.deleteById(id)
  return !!deletedCount
}

export const deleteAllAccounts = async ({ models }) => {
  const { deletedCount } = await models.Account.deleteMany()
  return !!deletedCount
}
