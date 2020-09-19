// node core modules

// 3rd party modules

// local modules

const attackSchedulerMiddleware = ({ models, auth, tribalWarsAdmin }) => async (req, res) => {
  // const executedAt = moment.utc().toDate()
  // const queryExecutionDue = { nextExecutionAt: { $lt: executedAt } }
  // // execute scheduled recruits
  // const recruitsToExecute = await models.RecruitConfig.find(queryExecutionDue).lean()
  //
  // console.log(`Executing scheduled [${recruitsToExecute.length}] recruits`)
  // if (recruitsToExecute.length) {
  //   for (const { _id, config, minimumIntervalInMinutes } of recruitsToExecute) {
  //     if (config) {
  //       tribalWarsAdmin({ config: { ...config, auth }, mode: RECRUIT_MODE })
  //       const nextExecutionAt = moment.utc().add(minimumIntervalInMinutes, 'minutes').toDate()
  //       await models.RecruitConfig.updateOne({ _id }, { $set: { executedAt, nextExecutionAt }, $inc: { executedTimes: 1 } })
  //       // delay always some random period
  //       await delay(roundRandomWithRange({ min: 2, max: 4 }) * 1000)
  //     }
  //   }
  // }

  res.end('Done')
}

const attackSchedulerConfig = {
  method: 'get',
  routeName: '/attack-scheduler',
  middleware: attackSchedulerMiddleware
}

export default {
  attackSchedulerConfig
}
