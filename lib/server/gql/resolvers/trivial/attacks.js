// node core modules

// 3rd party modules

// local modules

export default {
  AttackConfigType: {
    executedTimes: ({ getNumberOfIntervalExecutions }) => getNumberOfIntervalExecutions(),
    executedAt: ({ getDateOfLastExecution }) => getDateOfLastExecution()
  }
}
