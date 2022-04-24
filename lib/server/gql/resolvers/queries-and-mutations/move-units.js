// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getAllMoveUnitsConfigs: (__, ___, { methods, models }) => methods.getAllMoveUnitsConfigs({ models }),
    getMoveUnitsConfig: (__, { id }, { models, methods }) => methods.getMoveUnitsConfig({ id, models })
  },
  Mutation: {
    setMoveUnitsConfig: (__, { moveUnits }, { models, methods }) =>
      methods.setMoveUnitsConfig({ models, config: moveUnits }),
    activateMoveUnits: (__, { moveConfig }, { methods, auth }) =>
      methods.activateMoveUnits({ config: moveConfig, auth }),
    activateMoveSpecificUnits: (__, { moveSpecificConfig }, { methods, auth }) =>
      methods.activateMoveSpecificUnits({ config: moveSpecificConfig, auth }),
    deleteMoveUnitsConfig: (__, { id }, { models, methods }) =>
      methods.deleteMoveUnitsConfig({ models, id }),
    deleteAllMoveUnitsConfigs: (__, { id }, { models, methods }) =>
      methods.deleteAllMoveUnitsConfigs({ models })
  }
}
