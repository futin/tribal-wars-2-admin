// node core modules

// 3rd party modules
import _ from 'lodash'
import express from 'express'
import { AuthenticationError } from 'apollo-server'

// local modules
import tribalWarsExecutors from '#tw-executors'
import { mongoSetup, models } from './mongodb/index.js'
import methods from './methods/index.js'
import { typeDefs, resolvers } from './gql/index.js'
import setupCustomMiddlewares from './middlewares/index.js'

const { API_SECRET_TOKEN, TW_AUTH_NAME, TW_AUTH_TOKEN, TW_WORLD_NAME, GOOGLE_DOC_PRIVATE_KEY, GOOGLE_DOC_CLIENT_EMAIL, NODE_ENV } = process.env

const googleDocAuth = {}

if (GOOGLE_DOC_PRIVATE_KEY && GOOGLE_DOC_CLIENT_EMAIL) {
  Object.assign(googleDocAuth, {
    private_key: GOOGLE_DOC_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: GOOGLE_DOC_CLIENT_EMAIL
  })
}

const apolloServerSettings = {
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    if (_.isEmpty(req.body)) return
    const { authorization, account_id: accountId } = req.headers
    if (NODE_ENV === 'production' && !(authorization && authorization.includes(API_SECRET_TOKEN))) {
      throw new AuthenticationError('Unauthorized')
    }

    const builtContext = { methods, models, googleDocAuth }

    // load account and build auth
    if (!accountId) return builtContext

    const account = await methods.getAccount({ models, id: accountId })
    if (!account) return builtContext

    const auth = {
      name: TW_AUTH_NAME,
      token: TW_AUTH_TOKEN,
      worldName: TW_WORLD_NAME
    }

    return { ...builtContext, auth }
  }
}

const app = express()

// setup custom middlewares
setupCustomMiddlewares({ app, methods, models, tribalWarsExecutors })

export {
  app,
  apolloServerSettings,
  mongoSetup
}
