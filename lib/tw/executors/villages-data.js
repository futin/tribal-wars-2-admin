
// 3rd party modules
import _ from 'lodash'
import transform from 'oniyi-object-transform'

// local modules
import {
  AUTH_LOGIN_SUCCESS_TYPE_RECEIVE, CHARACTER_INFO_TYPE_RECEIVE, SYSTEM_ERROR_TYPE_RECEIVE,
  AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE, VILLAGES_DATA_TYPE_RECEIVE
} from '../../constants'

const mappedUnitTypes = {
  archer: 'Archer',
  axe: 'Axe',
  catapult: 'Catapult',
  doppelsoldner: 'Berserker',
  heavy_cavalry: 'Heavy Cavalry',
  knight: 'Knight',
  light_cavalry: 'Light Cavalry',
  mounted_archer: 'Mounted Archer',
  ram: 'Ram',
  snob: 'Nobleman',
  spear: 'Spearman',
  sword: 'Swordsman',
  trebuchet: 'Trebuchet'
}

const executors = ({ senders }) =>
  ({
    [AUTH_LOGIN_SUCCESS_TYPE_RECEIVE]: ({ response, config }) => {
      const { worldName } = config.auth
      const characters = _.get(response, 'data.characters', [])
      let character = characters[0]

      if (worldName) character = characters.find(character => character.world_name === worldName) || character

      const { character_id: characterId, world_id: worldId } = character

      senders.sendAuthCharSelectData({ characterId, worldId })
    },
    [AUTHENTICATION_CHARACTER_SELECTED_TYPE_RECEIVE]: ({ response }) => {
      const ownerId = _.get(response, 'data.owner_id')
      if (ownerId) return senders.sendGetCharacterInfo()
      senders.close('Character not found')
    },
    [CHARACTER_INFO_TYPE_RECEIVE]: ({ response, config }) => {
      if (!config.isVillageDataInfo) return console.log('Not called for retrieving village data info')

      const characterVillages = _.get(response, 'data.villages')
      const villageIds = characterVillages.map(({ id }) => id)
      senders.sendGetVillagesData({ villageIds })
    },
    [VILLAGES_DATA_TYPE_RECEIVE]: ({ response }) => {
      const res = _.reduce(response.data, (result, villageInfo) => {
        const availableUnits = _.get(villageInfo, 'Village/unitInfo.available_units')
        const village = _.get(villageInfo, 'Village/village')

        const mappedUnits = transform({
          src: availableUnits,
          map: mappedUnitTypes
        })

        const unitsWithTotal = _.reduce(mappedUnits, (totalUnits, unitCount, unitType) => {
          if (!result.total[unitType]) result.total[unitType] = 0
          result.total[unitType] += unitCount.total
          return { ...totalUnits, [unitType]: unitCount.total }
        }, {})

        _.set(result, village.name, unitsWithTotal)

        return result
      }, { total: {} })

      console.log('----------------------------\n', res)
      console.log('----------------------------')
    },
    [SYSTEM_ERROR_TYPE_RECEIVE]: ({ response }) => {
      const errorCause = _.get(response, 'data.cause')
      const errorCode = _.get(response, 'data.code')

      senders.close(`Error: ${errorCause};${errorCode}`)
    }
  })

export default executors
