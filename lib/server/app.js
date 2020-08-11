// node core modules
require('dotenv/config')
/* eslint-disable import/first */

// 3rd party modules
import { ApolloServer } from 'apollo-server-express'
import { ApolloError } from 'apollo-server'
import _ from 'lodash'

// local modules
import { typeDefs, resolvers } from './gql'
import tribalWarsAdmin from '../'
const express = require('express')

const { API_TOKEN } = process.env

const { AUTH_NAME, AUTH_TOKEN, WORLD_NAME } = process.env

const inMemoryStorage = {
  attackConfigs: [],
  recruitConfigs: []
}
const auth = {
  name: AUTH_NAME,
  token: AUTH_TOKEN,
  worldName: WORLD_NAME
}

const settings = {
  typeDefs,
  resolvers,
  context: ({ req }) => {
    if (_.isEmpty(req.body)) return
    const { authorization } = req.headers
    if (!authorization.includes(API_TOKEN)) {
      throw new ApolloError('Unauthorized', 401)
    }
    return { inMemoryStorage, tribalWarsAdmin, auth }
  }
}

const apolloServer = new ApolloServer(settings)
const app = express()
apolloServer.applyMiddleware({ app, path: '/' })

export default app
