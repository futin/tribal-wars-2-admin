// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getVillagesData: (__, { googleDocId }, { methods, auth, googleDocAuth }) => methods.getVillagesData({ auth, googleDocAuth, googleDocId })
  },
  Mutation: {
    activateMassMoveUnits: (__, { moveConfig }, { methods, auth }) => methods.activateMassMoveUnits({ config: { ...moveConfig, auth } }),
    activateMassDonation: (__, { massDonationConfig }, { methods, auth }) => methods.activateMassDonation({ config: { ...massDonationConfig, auth } })
  }
}
