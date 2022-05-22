// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getAllTradingResourcesConfigs: (__, ___, { methods, models }) => methods.getAllTradingResourcesConfigs({ models }),
    getTradingResourcesConfig: (__, { id }, { models, methods }) => methods.getTradingResourcesConfig({ id, models })
  },
  Mutation: {
    setTradingResourcesConfig: (__, { tradingResourcesConfig }, { models, methods }) =>
      methods.setTradingResourcesConfig({ models, config: tradingResourcesConfig }),
    activateImmediateTradingResources: (__, { tradingResourcesConfig }, { models, methods, auth }) =>
      methods.activateImmediateTradingResources({ models, config: tradingResourcesConfig, auth }),
    deleteTradingResourcesConfig: (__, { id }, { models, methods }) =>
      methods.deleteTradingResourcesConfig({ models, id }),
    deleteAllTradingResourcesConfigs: (__, { id }, { models, methods }) =>
      methods.deleteAllTradingResourcesConfigs({ models })
  }
}
