// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getVillageData: (__, { googleDocId }, { methods, auth, googleDocAuth }) => methods.getVillageData({ auth, googleDocAuth, googleDocId })
  },
  Mutation: {
    activateMassMoveUnits: (__, { moveConfig }, { methods, auth }) => methods.activateMassMoveUnits({ config: { ...moveConfig, auth } })
  }
}
