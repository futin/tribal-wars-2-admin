// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getUnitsCount: (__, { googleDocId }, { methods, auth, googleDocAuth }) => methods.getUnitsCount({ auth, googleDocAuth, googleDocId })
  }
}
