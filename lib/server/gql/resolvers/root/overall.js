// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getAllConfigs: (__, ___, { inMemoryStorage, methods }) => methods.getAllConfigs({ inMemoryStorage })
  },
  Mutation: {
    deleteConfig: (__, { id }, { inMemoryStorage, methods }) => methods.deleteConfig({ inMemoryStorage, id })
  }
}
