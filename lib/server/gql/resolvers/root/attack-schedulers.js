// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    calculateAttackLaunchTimes: (__, { attackScheduler }, { models, methods, auth }) =>
      methods.calculateAttackLaunchTimes({ models, config: { ...attackScheduler, auth } })
  },
  Mutation: {
    setAttackScheduler: (__, { attackScheduler }, { models, methods, auth }) =>
      methods.setAttackScheduler({ models, config: { ...attackScheduler, auth } }),
    deleteChainedAttackSchedulers: (__, { chainId }, { models, methods, auth }) =>
      methods.deleteChainedAttackSchedulers({ models, chainId, config: { auth } })
  }
}
