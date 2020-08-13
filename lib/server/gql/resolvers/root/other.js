// node core modules

// 3rd party modules

// local modules

export default {
  Mutation: {
    activateHealthCheck: (__, { intervalInMinutes = 15 }, { inMemoryStorage, methods }) =>
      methods.activateHealthCheck({ inMemoryStorage, intervalInMinutes }),
    deactivateHealthCheck: (__, ___, { inMemoryStorage, methods }) =>
      methods.deactivateHealthCheck({ inMemoryStorage })
  }
}
