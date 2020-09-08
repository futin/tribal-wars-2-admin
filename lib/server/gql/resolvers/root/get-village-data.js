// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getUnitsCount: (__, ___, { methods, auth }) => methods.getUnitsCount({ auth })
  }
}
