// node core modules

// 3rd party modules
import _ from 'lodash'
import moment from 'moment'

// local modules
import {
  MAP_VILLAGES_TYPE_RECEIVE, CHARACTER_INFO_TYPE_RECEIVE,
  MAP_VILLAGES_DETAILS_TYPE_RECEIVE,
  SYSTEM_ERROR_TYPE_RECEIVE, AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE,
  DEFAULT_TIMEZONE, LINE_SEPARATOR, DATE_FORMAT
} from '#global-constants'
import { transformDuration, transformTargetCoordinates } from './utils.js'

const executors = ({ senders, emitterKey }) => {
  const executionInstance = {}
  const ERROR_RESPONSE = { emitterKey, isError: true }

  const collectTargetVillagesData = () => {
    const { originVillage: { id, name }, targetVillages, currentTargetVillageIndex, targetVillagesLeft } = executionInstance

    if (!targetVillagesLeft || !targetVillages[currentTargetVillageIndex]) {
      console.log(`No more target villages for [${name}]`)
      return distanceCalculationAndAttackPlanner()
    }

    const targetVillage = targetVillages[currentTargetVillageIndex]
    if (!targetVillage) {
      console.log(`No more target villages for [${name}] (2)`)
      return distanceCalculationAndAttackPlanner()
    }

    senders.sendGetVillageDetails({ originVillageId: id, targetVillageId: targetVillage.id })
  }

  const distanceCalculationAndAttackPlanner = () => {
    let { originVillage: { name, x, y }, targetVillagesDistances, unitType, arrivalDate, timezone = DEFAULT_TIMEZONE } = executionInstance
    arrivalDate = moment.utc(arrivalDate)

    const now = moment.utc().format(DATE_FORMAT)

    const targets = targetVillagesDistances
      .map(target => {
        const { travelDurations, name } = target
        const timeInSeconds = travelDurations[unitType]

        if (!timeInSeconds) {
          console.log('Time not found for target', name)
          return null
        }
        delete target.travelDurations

        const launchTime = arrivalDate.clone().add(-timeInSeconds, 'seconds').format(DATE_FORMAT)

        // can't set launch time in the past
        if (now > launchTime) return null
        const travelTime = transformDuration(moment.duration(timeInSeconds, 'seconds'))
        return { ...target, launchTime, travelTime }
      })
      .filter(Boolean)

    if (!targets.length) {
      return senders.close('Targets not found', ERROR_RESPONSE)
    }

    const data = {
      name,
      x,
      y,
      unitType,
      timezone,
      targets,
      arrivalDate: arrivalDate.format(DATE_FORMAT)
    }

    if (!emitterKey) {
      console.log('\nTARGETS', LINE_SEPARATOR)
      console.log(data)
      console.log(LINE_SEPARATOR)
    }

    senders.close('Done', { emitterKey, emitterPayload: data })
  }

  return ({
    [AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE]: ({ response }) => {
      const ownerId = _.get(response, 'data.owner_id')
      if (ownerId) return senders.sendGetCharacterInfo()
      const errorMessage = 'Character not found'
      senders.close(errorMessage, ERROR_RESPONSE)
    },
    [CHARACTER_INFO_TYPE_RECEIVE]: ({ response, config }) => {
      if (!config.isAttackSchedulerCalculation) return console.log('Not called for attack calculation')
      let { targets = [], originVillageName, unitType, arrivalDate, timezone } = config
      const characterVillages = _.get(response, 'data.villages')

      const originVillage = characterVillages.find(({ name }) => name.includes(originVillageName))

      if (!originVillage) return senders.close(`Origin village for name [${originVillageName}] not found`, ERROR_RESPONSE)
      if (!targets.length) return senders.close(`Targets not provided for village [${originVillageName}]`, ERROR_RESPONSE)
      // remove white space
      targets = targets.map(target => target.replace(/\s/g, ''))

      const transformedTargets = transformTargetCoordinates(targets)
      if (!transformedTargets.length) return senders.close(`Targets have invalid format for village [${originVillageName}]`, ERROR_RESPONSE)

      // getting the middle point of all targets allows
      // us to attack any distant cluster
      const middleX = Math.round(transformedTargets.reduce((result, { x }) => result + x, 0) / transformedTargets.length)
      const middleY = Math.round(transformedTargets.reduce((result, { y }) => result + y, 0) / transformedTargets.length)

      const width = Math.max(...transformedTargets.map(({ x }) => Math.abs(x - middleX))) + 2
      const height = Math.max(...transformedTargets.map(({ y }) => Math.abs(y - middleY))) + 2

      const x = middleX - width
      const y = middleY - height

      Object.assign(executionInstance, { originVillage, transformedTargets, unitType, arrivalDate, timezone })
      senders.sendGetVillagesByArea({ x, y, width: width * 2, height: height * 2 })
    },
    [MAP_VILLAGES_TYPE_RECEIVE]: ({ response }) => {
      const { originVillage: { name }, transformedTargets } = executionInstance
      const villages = _.get(response, 'data.villages', [])

      if (!villages.length) {
        return senders.close(`Villages not found for village [${name}]`, ERROR_RESPONSE)
      }

      const targetVillages = villages.filter(({ x, y }) =>
        transformedTargets.find(({ x: targetX, y: targetY }) =>
          x === targetX && y === targetY))

      if (targetVillages.length !== transformedTargets.length) {
        return senders.close('Some of the targets were not found', ERROR_RESPONSE)
      }

      Object.assign(executionInstance, { targetVillages, currentTargetVillageIndex: 0, targetVillagesLeft: targetVillages.length, targetVillagesDistances: [] })
      collectTargetVillagesData()
    },
    [MAP_VILLAGES_DETAILS_TYPE_RECEIVE]: ({ response }) => {
      const { originVillage: { name } } = executionInstance
      const targetVillageName = _.get(response, 'data.village_name')
      const targetVillageId = _.get(response, 'data.village_id')
      const travelDurations = _.get(response, 'data.walking_durations', [])
      const x = _.get(response, 'data.village_x')
      const y = _.get(response, 'data.village_y')

      executionInstance.currentTargetVillageIndex += 1
      executionInstance.targetVillagesLeft -= 1

      if (_.isEmpty(travelDurations)) {
        console.log(`Something went wrong with collection for origin village [${name}] and target village [${targetVillageName}]`)
        return collectTargetVillagesData()
      }

      executionInstance.targetVillagesDistances.push({ name: targetVillageName, id: targetVillageId, travelDurations, x, y })
      collectTargetVillagesData()
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')

      senders.close(`Error: ${errorCause};${errorCode}`, ERROR_RESPONSE)
    }
  })
}

export default executors
