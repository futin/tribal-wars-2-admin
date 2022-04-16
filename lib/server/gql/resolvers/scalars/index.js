// node core modules

// 3rd party modules
import { GraphQLScalarType } from 'graphql'
import moment from 'moment-timezone'

// local modules
import { DATE_FORMAT } from '@global-constants'

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date represented as utc string YYYY-MM-DD HH:mm:ss',
  serialize: (value) => {
    return moment.utc(value).format(DATE_FORMAT)
  },
  parseValue: (value) => {
    return moment.utc(value, DATE_FORMAT).toDate()
  },
  parseLiteral: ({ value }) => {
    return moment.utc(value, DATE_FORMAT).toDate()
  }
})

const Dynamic = new GraphQLScalarType({
  name: 'Dynamic',
  description: 'JSON response',
  serialize: value => value,
  parseValue: value => value,
  parseLiteral: ({ value }) => value
})
export default {
  DateTime,
  Dynamic
}
