// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getVillagesData: (__, { googleDocId }, { methods, auth, googleDocAuth }) => methods.getVillagesData({ auth, googleDocAuth, googleDocId })
  },
  Mutation: {
    activateMassDonation: (__, { massDonationConfig }, { methods, auth }) => methods.activateMassDonation({ config: massDonationConfig, auth }),
    activateImmediateSpyRecruit: (__, { spyRecruitConfig }, { methods, auth }) => methods.activateImmediateSpyRecruit({ config: spyRecruitConfig, auth })
  }
}
