// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getAllRecruitConfigs: (__, ___, { models, methods }) => methods.getAllRecruitConfigs({ models }),
    getRecruitConfig: (__, { id }, { models, methods }) => methods.getRecruitConfig({ models, id })
  },
  Mutation: {
    setRecruitConfig: (__, { recruitConfig }, { models, methods }) =>
      methods.setRecruitConfig({ models, config: recruitConfig }),
    activateImmediateRecruit: (__, { recruitConfig }, { models, methods, auth }) =>
      methods.activateImmediateRecruit({ models, config: recruitConfig, auth }),
    deleteRecruitConfig: (__, { id }, { models, methods }) =>
      methods.deleteRecruitConfig({ models, id }),
    deleteAllRecruitConfigs: (__, { id }, { models, methods }) =>
      methods.deleteAllRecruitConfigs({ models })
  }
}
