// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getAllFarmingConfigs: (__, ___, { methods, models }) => methods.getAllFarmingConfigs({ models }),
    getFarmingConfig: (__, { id }, { models, methods }) => methods.getFarmingConfig({ id, models })
  },
  Mutation: {
    setFarmingConfig: (__, { farmingConfig }, { models, methods }) =>
      methods.setFarmingConfig({ models, config: farmingConfig }),
    activateImmediateFarming: (__, { farmingConfig }, { models, methods, auth }) =>
      methods.activateImmediateFarming({ models, config: farmingConfig, auth }),
    deleteFarmingConfig: (__, { id }, { models, methods }) =>
      methods.deleteFarmingConfig({ models, id }),
    deleteAllFarmingConfigs: (__, { id }, { models, methods }) =>
      methods.deleteAllFarmingConfigs({ models })
  }
}
