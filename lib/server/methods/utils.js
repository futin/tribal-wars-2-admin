// node core modules

// 3rd party modules
import moment from 'moment'

// local modules
import { DATE_FORMAT, DEFAULT_TIMEZONE } from '../../constants'

export const transformAttackScheduler = attackScheduler => {
  const { arrivalDate, targets, timezone = DEFAULT_TIMEZONE } = attackScheduler
  attackScheduler.arrivalDate = moment.utc(arrivalDate, DATE_FORMAT).tz(timezone).format(DATE_FORMAT)
  attackScheduler.targets = targets.map(target => ({ ...target, launchTime: moment.utc(target.launchTime, DATE_FORMAT).tz(timezone).format(DATE_FORMAT) }))
  return attackScheduler
}
