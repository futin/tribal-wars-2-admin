// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getAllSchedulers: (__, { filter }, { models, methods }) =>
      methods.getAllSchedulers({ models, ...filter }),
    getScheduler: (__, { id }, { models, methods }) =>
      methods.getScheduler({ models, id })
  },
  Mutation: {
    setScheduler: (__, { scheduler: payload }, { models, methods, auth }) =>
      methods.setScheduler({ models, methods, payload, auth }),
    deleteScheduler: (__, { id }, { models, methods }) =>
      methods.deleteScheduler({ models, id }),
    deleteAllSchedulers: (__, ___, { models, methods }) =>
      methods.deleteAllSchedulers({ models })
  }
}
