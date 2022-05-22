
// 3rd party modules
import _ from 'lodash'
import transform from 'oniyi-object-transform'

// local modules
import {
  CHARACTER_INFO_TYPE_RECEIVE, SYSTEM_ERROR_TYPE_RECEIVE,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE, VILLAGES_DATA_TYPE_RECEIVE
} from '#global-constants'

const mappedUnitTypes = {
  archer: 'Archer',
  axe: 'Axe',
  catapult: 'Catapult',
  doppelsoldner: 'Berserker',
  heavy_cavalry: 'Heavy Cavalry',
  knight: 'Paladin',
  light_cavalry: 'Light Cavalry',
  mounted_archer: 'Mounted Archer',
  ram: 'Ram',
  snob: 'Nobleman',
  spear: 'Spearman',
  sword: 'Swordsman',
  trebuchet: 'Trebuchet'
}

const mappedResourceTypes = {
  food: 'Provisions',
  iron: 'Iron',
  clay: 'Clay',
  wood: 'Wood'
}

const executors = ({ senders, emitterKey }) => {
  const ERROR_RESPONSE = { emitterKey, isError: true }

  return {
    [AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE]: ({ response }) => {
      const ownerId = _.get(response, 'data.owner_id')
      if (ownerId) return senders.sendGetCharacterInfo()
      senders.close('Character not found', ERROR_RESPONSE)
    },
    [CHARACTER_INFO_TYPE_RECEIVE]: ({ response, config }) => {
      if (!config.isVillageDataInfo) return console.log('Not called for retrieving village data info')

      const characterVillages = _.get(response, 'data.villages')
      const villageIds = characterVillages.map(({ id }) => id)
      senders.sendGetVillagesData({ villageIds })
    },
    [VILLAGES_DATA_TYPE_RECEIVE]: ({ response }) => {
      const units = _.reduce(response.data, (result, villageInfo) => {
        const availableUnits = _.get(villageInfo, 'Village/unitInfo.available_units')
        const village = _.get(villageInfo, 'Village/village')

        const mappedUnits = transform({
          src: availableUnits,
          map: mappedUnitTypes
        })

        const unitsWithTotal = _.reduce(mappedUnits, (totalUnits, unitCount, unitType) => {
          if (!result.Total[unitType]) result.Total[unitType] = 0
          result.Total[unitType] += unitCount.total
          return { ...totalUnits, [unitType]: unitCount.total }
        }, {})

        _.set(result, village.name, unitsWithTotal)

        return result
      }, { Total: {} })

      const resources = _.reduce(response.data, (result, villageInfo) => {
        const availableResources = _.get(villageInfo, 'Village/village.resources')
        const storage = _.get(villageInfo, 'Village/village.storage')
        const village = _.get(villageInfo, 'Village/village')

        const mappedResources = transform({
          src: availableResources,
          map: mappedResourceTypes
        })

        const resourcesWithTotal = _.reduce(mappedResources, (resourcesResult, resourceCount, resourceType) => {
          if (!result.Total[resourceType]) result.Total[resourceType] = 0
          result.Total[resourceType] += resourceCount
          return {
            ...resourcesResult,
            [resourceType]: resourceCount
          }
        }, {})

        _.set(result, village.name, { ...resourcesWithTotal, Storage: storage })

        return result
      }, { Total: {} })

      const data = {
        units,
        resources
      }

      senders.close('Done', { emitterKey, emitterPayload: data })
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')

      senders.close(`Error: ${errorCause};${errorCode}`, ERROR_RESPONSE)
    }
  }
}

export default executors
