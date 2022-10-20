
// 3rd party modules
import _ from 'lodash'

// local modules
import {
  CHARACTER_INFO_TYPE_RECEIVE,
  SYSTEM_ERROR_TYPE_RECEIVE,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE,
  VILLAGES_DATA_TYPE_RECEIVE, RESOURCE_DEPOSIT_INFO_RECEIVE,
  MESSAGE_ERROR_TYPE_RECEIVE, RESOURCE_DEPOSIT_COLLECTED_RECEIVE, RESOURCE_DEPOSIT_STARTED_JOB_RECEIVE
} from '#global-constants'

const resourceDepositJobConfig = {
  HIGH_AMOUNT: jobs => jobs.sort((x, y) => x.amount - y.amount),
  HIGH_QUALITY: jobs => jobs.sort((x, y) => y.quality - x.quality),
  FAST: jobs => jobs.sort((x, y) => y.duration - x.duration),
  WOOD: jobs => jobs.sort((x, y) => y.resource_type === 'wood' ? 1 : -1),
  CLAY: jobs => jobs.sort((x, y) => y.resource_type === 'clay' ? 1 : -1),
  IRON: jobs => jobs.sort((x, y) => y.resource_type === 'iron' ? 1 : -1)
}

const resourceDepositVillageConfig = {
  AVAILABLE_STORAGE: (villages, resourceType) => villages.sort((x, y) => y[resourceType] - x[resourceType])
}

const findNextResourceDepositJob = (jobs, nextResourceDepositJobPriority) =>
  resourceDepositJobConfig[nextResourceDepositJobPriority](jobs)[0]

const findResourceDepositVillageToCollect = (villages, villageToCollectResourceDepositPriority, resourceType) =>
  resourceDepositVillageConfig[villageToCollectResourceDepositPriority](villages, resourceType)[0]

const executors = ({ senders, emitterKey }) => {
  const executionInstance = {}
  const ERROR_RESPONSE = { emitterKey, isError: true }

  return ({
    [AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE]: ({ response }) => {
      const ownerId = _.get(response, 'data.owner_id')
      if (ownerId) return senders.sendGetCharacterInfo()
      senders.close('Character not found')
    },
    [CHARACTER_INFO_TYPE_RECEIVE]: ({ response, config }) => {
      if (!config.isResourceDeposit) return console.log('Not called for resource deposit')

      const characterVillages = _.get(response, 'data.villages')
      const villageIds = characterVillages.map(({ id }) => id)

      Object.assign(executionInstance, { villageIds })
      senders.sendResourceDepositOpen()
    },
    [RESOURCE_DEPOSIT_INFO_RECEIVE]: ({ response, config }) => {
      const { villageIds } = executionInstance
      const { data: { jobs = [], time_next_reset: nextErrandTime } } = response
      const { nextResourceDepositJobPriority } = config
      const activeJob = jobs.find(job => job.time_completed)

      if (activeJob) {
        Object.assign(executionInstance, { activeJob })

        const { time_completed: timeCompleted } = activeJob
        const now = new Date()
        const jobCompleteDate = new Date(timeCompleted * 1000)

        if (jobCompleteDate <= now) return senders.sendGetVillagesData({ villageIds })

        senders.close('Active job not done yet', { emitterKey, emitterPayload: { timeCompleted } })
        return
      }

      const nextJob = findNextResourceDepositJob(jobs, nextResourceDepositJobPriority)
      if (!nextJob) {
        senders.close('No more jobs for now', { emitterKey, emitterPayload: { timeCompleted: nextErrandTime } })
        return
      }

      senders.sendResourceDepositStartJob({ jobId: nextJob.id })
    },
    [VILLAGES_DATA_TYPE_RECEIVE]: ({ response, config }) => {
      const { activeJob } = executionInstance
      const { villageToCollectResourceDepositPriority } = config
      const resourcesLeftByVillage = _.reduce(response.data, (result, villageInfo) => {
        const availableResources = _.pick(_.get(villageInfo, 'Village/village.resources'), ['wood', 'clay', 'iron'])
        const storage = _.get(villageInfo, 'Village/village.storage')
        const village = _.get(villageInfo, 'Village/village')

        const resourcesLeft = _.reduce(availableResources, (resourcesResult, resourceCount, resourceType) => ({ ...resourcesResult, [resourceType]: storage - resourceCount }), {})
        result.push({ name: village.name, id: village.villageId, ...resourcesLeft })

        return result
      }, [])

      const villageToCollect = findResourceDepositVillageToCollect(resourcesLeftByVillage, villageToCollectResourceDepositPriority, activeJob.resource_type)

      console.log(`Village to collect next job is ${villageToCollect.name}`)
      senders.sendResourceDepositCollect({ jobId: activeJob.id, villageId: villageToCollect.id })
    },
    [RESOURCE_DEPOSIT_COLLECTED_RECEIVE]: ({ response }) => {
      const jobId = _.get(response, 'data.job_id')

      if (jobId) return senders.sendResourceDepositOpen()

      senders.close('Something went wrong with received collection', ERROR_RESPONSE)
    },
    [RESOURCE_DEPOSIT_STARTED_JOB_RECEIVE]: ({ response }) => {
      const jobId = _.get(response, 'data.job_id')
      const timeCompleted = _.get(response, 'data.time_completed')

      if (jobId) return senders.close('Job started', { emitterKey, emitterPayload: { timeCompleted } })

      senders.close('Something went wrong with job completed', ERROR_RESPONSE)
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')

      senders.close(`Error: ${errorCause};${errorCode}`, ERROR_RESPONSE)
    },
    [MESSAGE_ERROR_TYPE_RECEIVE]: ({ response }) => {
      const errorCause = _.get(response, 'data.message')
      const errorCode = _.get(response, 'data.error_code')

      senders.close(`Error: ${errorCause};${errorCode}`, ERROR_RESPONSE)
    }
  })
}

export default executors
