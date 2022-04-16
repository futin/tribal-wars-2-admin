// core modules

// 3rd party modules
import _ from 'lodash'

// internal alias modules

// internal modules
import mongoSetup from './setup.js'
import models from './models/index.js'
import * as additionalMethods from './additional-methods.js'

_.forEach(models, model => {
  _.forEach(additionalMethods, (method, methodName) => {
    model[methodName] = method.bind(model)
  })
})

export {
  mongoSetup,
  models
}
