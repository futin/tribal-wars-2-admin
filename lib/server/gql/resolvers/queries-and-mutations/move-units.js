// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getAllRelocateUnitsConfigs: (__, ___, { methods, models }) => methods.getAllRelocateUnitsConfigs({ models }),
    getRelocateUnitsConfig: (__, { id }, { models, methods }) => methods.getRelocateUnitsConfig({ id, models })
  },
  Mutation: {
    setRelocateUnitsConfig: (__, { relocateConfig }, { models, methods }) =>
      methods.setRelocateUnitsConfig({ models, config: relocateConfig }),
    activateRelocateUnits: (__, { relocateConfig }, { methods, auth }) =>
      methods.activateRelocateUnits({ config: relocateConfig, auth }),
    activateMoveSpecificUnits: (__, { moveSpecificConfig }, { methods, auth }) =>
      methods.activateMoveSpecificUnits({ config: moveSpecificConfig, auth }),
    deleteRelocateUnitsConfig: (__, { id }, { models, methods }) =>
      methods.deleteRelocateUnitsConfig({ models, id }),
    deleteAllRelocateUnitsConfigs: (__, { id }, { models, methods }) =>
      methods.deleteAllRelocateUnitsConfigs({ models })
  }
}
