// node core modules

// 3rd party modules

// local modules

export default {
  AccountType: {
    id: ({ _id }) => _id,
    uniqueId: ({ uniqueId }) => uniqueId.toUpperCase()
  }
}
