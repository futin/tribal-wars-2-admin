// node core modules

// 3rd party modules
import { ApolloServer } from 'apollo-server-express'
import _ from 'lodash'

// local modules
import { typeDefs, resolvers } from './gql'
import tribalWarsAdmin from '../'

const { API_TOKEN } = process.env

const express = require('express')

const inMemoryStorage = {
  attackConfigs: [],
  recruitConfigs: []
}

const settings = {
  typeDefs,
  resolvers,
  context: ({ req }) => {
    if (_.isEmpty(req.body)) return
    const { authorization } = req.headers
    if (authorization.includes(API_TOKEN)) return
    return { inMemoryStorage, tribalWarsAdmin }
  }
}

const apolloServer = new ApolloServer(settings)
const app = express()
apolloServer.applyMiddleware({ app, path: '/' })

export default app
