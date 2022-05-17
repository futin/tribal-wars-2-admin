// node core modules

// 3rd party modules

// local modules

export default {
  BuildingUpgradeConfigType: {
    id: ({ _id }) => _id,
    buildingCommands: ({ config }) => config?.buildingCommands,
    maxLevelPerBuildingName: ({ config }) => config?.maxLevelPerBuildingName,
    buildingPriority: ({ config }) => config?.buildingPriority,
    villageName: ({ config }) => config?.villageName,
    executedTimes: ({ executedTimes }) => executedTimes || 0,
    failedTimes: ({ failedTimes }) => failedTimes || 0
  }
}
