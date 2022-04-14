// node core modules

// 3rd party modules
import _ from 'lodash'

// local modules
import { includeAllFiles } from '@global-utils'

const middlewareConfigs = includeAllFiles({ pathToDirectory: __dirname, reduceToObjects: true })

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
