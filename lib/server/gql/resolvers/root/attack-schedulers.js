// node core modules

// 3rd party modules

// local modules

export default {
  Mutation: {
    activateImmediateAttackScheduler: (__, { attackScheduler }, { models, methods, auth }) =>
      methods.activateImmediateAttackScheduler({ models, config: { ...attackScheduler, auth } })
  }
}
