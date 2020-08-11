// node core modules

// 3rd party modules

// local modules

export default {
  RecruitConfigType: {
    executedTimes: ({ getNumberOfIntervalExecutions }) => getNumberOfIntervalExecutions(),
    executedAt: ({ getDateOfLastExecution }) => getDateOfLastExecution()
  }
}
