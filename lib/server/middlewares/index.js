// node core modules

// 3rd party modules
import _ from 'lodash'

// local modules
import AuthConfig from './auth.js'
import SchedulerConfig from './scheduler/index.js'
import AttackScheduler from './attack-scheduler.js'
import Health from './health.js'
import MassDonation from './mass-donation.js'

const middlewareConfigs = [AuthConfig, SchedulerConfig, AttackScheduler, Health, MassDonation]

const defineMiddlewares = ({ app, ...args }) => {
  _.forEach(middlewareConfigs, (config) => {
    const { method, routeName, middleware, isUse } = config

    if (isUse) {
      app.use(middleware(args))
      return
    }

    app[method](routeName, middleware(args))
  })
}

export default defineMiddlewares
