// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getAllConfigs: (__, ___, { inMemoryStorage }) => inMemoryStorage
  },
  Mutation: {
    deleteConfig: (__, ___, { inMemoryStorage }) => inMemoryStorage
  }
}
