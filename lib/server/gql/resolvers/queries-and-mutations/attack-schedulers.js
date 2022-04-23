// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    calculateAttackLaunchTimes: (__, { attackScheduler }, { models, methods, auth }) =>
      methods.calculateAttackLaunchTimes({ models, config: { ...attackScheduler, auth } }),
    getScheduledAttacks: (__, { filter }, { models, methods }) =>
      methods.getScheduledAttacks({ models, ...filter })
  },
  Mutation: {
    setAttackScheduler: (__, { attackScheduler }, { models, methods, auth }) =>
      methods.setAttackScheduler({ models, config: { ...attackScheduler, auth } }),
    deleteChainedAttackSchedulers: (__, { chainId }, { models, methods }) =>
      methods.deleteChainedAttackSchedulers({ models, chainId }),
    deleteAllAttackSchedulers: (__, ___, { models, methods }) =>
      methods.deleteAllAttackSchedulers({ models })
  }
}
