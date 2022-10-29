// node core modules

// 3rd party modules

// local modules
import { buildAuth } from '#global-utils'

const useAuthMiddleware = ({ models, methods }) => async (req, res, next) => {
  const { account_id: accountId } = req.headers
  req.auth = await buildAuth({ models, methods, accountId })
  req.accountId = accountId
  next()
}

const authConfig = {
  isUse: true,
  routeName: '/auth',
  middleware: useAuthMiddleware
}

export default authConfig
