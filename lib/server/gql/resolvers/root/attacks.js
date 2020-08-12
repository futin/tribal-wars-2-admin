// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getAllAttackConfigs: (__, ___, { inMemoryStorage, methods }) => methods.getAllAttackConfigs({ inMemoryStorage }),
    getAttackConfig: (__, { id }, { inMemoryStorage, methods }) => methods.getAttackConfig({ inMemoryStorage, id })
  },
  Mutation: {
    setAttackConfig: (__, { attackConfig: { minimumIntervalInMinutes, ...config } }, { inMemoryStorage, methods, auth }) =>
      methods.setAttackConfig({ inMemoryStorage, minimumIntervalInMinutes, config: { ...config, auth } }),
    deleteAttackConfig: (__, { id }, { inMemoryStorage, methods }) =>
      methods.deleteAttackConfig({ inMemoryStorage, id }),
    activateImmediateAttack: (__, { attackConfig: { minimumIntervalInMinutes, ...config } }, { inMemoryStorage, methods, auth }) =>
      methods.activateImmediateAttack({ inMemoryStorage, config: { ...config, auth } })
  }
}
