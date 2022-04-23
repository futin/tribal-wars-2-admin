// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getAllConfigs: (__, ___, { methods, models }) => methods.getAllConfigs({ models })
  },
  Mutation: {
    deleteAllConfigs: (__, ___, { methods, models }) => methods.deleteAllConfigs({ models })
  }
}
