// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getAllAccounts: (__, ___, { models, methods }) => methods.getAllAccounts({ models }),
    getAccount: (__, { id }, { models, methods }) => methods.getAccount({ models, id })
  },
  Mutation: {
    setAccount: (__, { account: payload }, { models, methods }) =>
      methods.setAccount({ models, payload }),
    deleteAccount: (__, { id }, { models, methods }) =>
      methods.deleteAccount({ models, id }),
    deleteAllAccounts: (__, { id }, { models, methods }) =>
      methods.deleteAllAccounts({ models })
  }
}
