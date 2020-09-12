// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getAllAttackConfigs: (__, ___, { methods, models }) => methods.getAllAttackConfigs({ models }),
    getAttackConfig: (__, { id }, { models, methods }) => methods.getAttackConfig({ id, models })
  },
  Mutation: {
    setAttackConfig: (__, { attackConfig: { minimumIntervalInMinutes, ...config } }, { models, methods, auth }) =>
      methods.setAttackConfig({ models, minimumIntervalInMinutes, config: { ...config, auth } }),
    activateImmediateAttack: (__, { attackConfig: { minimumIntervalInMinutes, ...config } }, { models, methods, auth }) =>
      methods.activateImmediateAttack({ models, config: { ...config, auth } }),
    deleteAttackConfig: (__, { id }, { models, methods }) =>
      methods.deleteAttackConfig({ models, id }),
    deleteAllAttackConfigs: (__, { id }, { models, methods }) =>
      methods.deleteAllAttackConfigs({ models })
  }
}
