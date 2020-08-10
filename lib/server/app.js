// node core modules

// 3rd party modules
import { ApolloServer } from 'apollo-server-express'

// local modules
import { typeDefs, resolvers } from './gql'

const express = require('express')

const settings = {
  typeDefs,
  resolvers
}

const apolloServer = new ApolloServer(settings)
const app = express()
apolloServer.applyMiddleware({ app, path: '/' })

export default app
