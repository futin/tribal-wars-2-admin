// node core modules

// 3rd party modules
import _ from 'lodash'

// local modules
import { includeAllFiles } from '../../../utils'
import * as additionalMethods from '../additional-methods'

const models = includeAllFiles({ pathToDirectory: __dirname, reduceToObjects: true })

// monkeypatch the models
_.forEach(models, model => {
  _.forEach(additionalMethods, (method, methodName) => {
    model[methodName] = method.bind(model)
  })
})

export default models
