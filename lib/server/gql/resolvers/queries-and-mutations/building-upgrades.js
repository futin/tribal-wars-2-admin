// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getAllBuildingUpgradeConfigs: (__, ___, { methods, models }) => methods.getAllBuildingUpgradeConfigs({ models }),
    getBuildingUpgradeConfig: (__, { id }, { models, methods }) => methods.getBuildingUpgradeConfig({ id, models })
  },
  Mutation: {
    setBuildingUpgradeConfig: (__, { buildingUpgradeConfig }, { models, methods }) =>
      methods.setBuildingUpgradeConfig({ models, config: buildingUpgradeConfig }),
    activateImmediateBuildingUpgrade: (__, { buildingUpgradeConfig }, { models, methods, auth }) =>
      methods.activateImmediateBuildingUpgrade({ models, config: buildingUpgradeConfig, auth }),
    deleteBuildingUpgradeConfig: (__, { id }, { models, methods }) =>
      methods.deleteBuildingUpgradeConfig({ models, id }),
    deleteAllBuildingUpgradeConfigs: (__, { id }, { models, methods }) =>
      methods.deleteAllBuildingUpgradeConfigs({ models })
  }
}
