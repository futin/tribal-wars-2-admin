// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getAllResourceDepositConfigs: (__, ___, { methods, models }) => methods.getAllResourceDepositConfigs({ models }),
    getResourceDepositConfig: (__, { id }, { models, methods }) => methods.getResourceDepositConfig({ id, models })
  },
  Mutation: {
    setResourceDepositConfig: (__, { resourceDepositConfig }, { models, methods }) =>
      methods.setResourceDepositConfig({ models, config: resourceDepositConfig }),
    activateImmediateResourceDeposit: (__, { resourceDepositConfig }, { models, methods, auth }) =>
      methods.activateImmediateResourceDeposit({ models, config: resourceDepositConfig, auth }),
    deleteResourceDepositConfig: (__, { id }, { models, methods }) =>
      methods.deleteResourceDepositConfig({ models, id }),
    deleteAllResourceDepositConfigs: (__, { id }, { models, methods }) =>
      methods.deleteAllResourceDepositConfigs({ models })
  }
}
