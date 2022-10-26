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
  const account = {
    createdAt,
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
