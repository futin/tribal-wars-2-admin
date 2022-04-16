// node core modules

// 3rd party modules

// local modules

export default {
  Mutation: {
    setBuildingUpgradeConfig: (__, { buildingUpgradeConfig }, { models, methods, auth }) =>
      methods.setBuildingUpgradeConfig({ models, config: { ...buildingUpgradeConfig, auth } }),
    activateImmediateBuildingUpgrade: (__, { buildingUpgradeConfig }, { models, methods, auth }) =>
      methods.activateImmediateBuildingUpgrade({ models, config: { ...buildingUpgradeConfig, auth } })
  }
}
