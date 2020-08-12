// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getAllRecruitConfigs: (__, ___, { inMemoryStorage, methods }) => methods.getAllRecruitConfigs({ inMemoryStorage }),
    getRecruitConfig: (__, { id }, { inMemoryStorage, methods }) => methods.getRecruitConfig({ inMemoryStorage, id })
  },
  Mutation: {
    setRecruitConfig: (__, { recruitConfig: { minimumIntervalInMinutes, ...config } }, { inMemoryStorage, methods, auth }) =>
      methods.setRecruitConfig({ inMemoryStorage, minimumIntervalInMinutes, config: { ...config, auth } }),
    activateImmediateRecruit: (__, { recruitConfig: { minimumIntervalInMinutes, ...config } }, { inMemoryStorage, methods, auth }) =>
      methods.activateImmediateRecruit({ inMemoryStorage, config: { ...config, auth } }),
    deleteRecruitConfig: (__, { id }, { inMemoryStorage, methods }) =>
      methods.deleteRecruitConfig({ inMemoryStorage, id }),
    deleteAllRecruitConfigs: (__, { id }, { inMemoryStorage, methods }) =>
      methods.deleteAllRecruitConfigs({ inMemoryStorage })
  }
}
