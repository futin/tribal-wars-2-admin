// node core modules

// 3rd party modules

// local modules

export default {
  BuildingUpgradeConfigType: {
    id: ({ _id }) => _id,
    buildingOrder: ({ config }) => config?.buildingOrder,
    buildingPriority: ({ config }) => config?.buildingOrder
  }
}
