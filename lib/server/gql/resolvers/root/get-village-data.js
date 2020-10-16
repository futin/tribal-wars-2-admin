// node core modules

// 3rd party modules

// local modules

export default {
  Query: {
    getUnitsCount: (__, { googleSheetDocId }, { methods, auth }) => methods.getUnitsCount({ auth, googleSheetDocId })
  }
}
