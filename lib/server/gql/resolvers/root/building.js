// node core modules

// 3rd party modules

// local modules

export default {
  Mutation: {
    setBuildingConfig: (__, { buildingConfig }, { models, methods, auth }) =>
      methods.setBuildingConfig({ models, config: { ...buildingConfig, auth } }),
    activateImmediateBuild: (__, { buildingConfig }, { models, methods, auth }) =>
      methods.activateImmediateBuild({ models, config: { ...buildingConfig, auth } })
  }
}
