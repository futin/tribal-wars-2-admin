// node core modules

// 3rd party modules
import { GraphQLScalarType } from 'graphql'
import { ApolloError } from 'apollo-server'
import moment from 'moment-timezone'

// local modules
import { DATE_FORMAT } from '#global-constants'

const dateTimeParser = value => moment.utc(value).format(DATE_FORMAT)
const percentageParser = value => {
  if (Number.isInteger(value) && value >= 1 && value <= 100) return value
  throw new ApolloError('Not a valid percentage value')
}

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date represented as utc string YYYY-MM-DD HH:mm:ss',
  serialize: dateTimeParser,
  parseValue: dateTimeParser,
  parseLiteral: ({ value }) => {
    return dateTimeParser(value)
  }
})

const Dynamic = new GraphQLScalarType({
  name: 'Dynamic',
  description: 'JSON response',
  serialize: value => value,
  parseValue: value => value,
  parseLiteral: ({ value }) => value
})

const Percentage = new GraphQLScalarType({
  name: 'Percentage',
  description: 'Percentage value, must be an integer between 1 and 100',
  parseValue: percentageParser,
  parseLiteral: ({ value }) => percentageParser(value)
})

export default {
  DateTime,
  Dynamic,
  Percentage
}
