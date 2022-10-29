// node core modules
import http from 'http'

// local modules
import axios from 'axios'
import 'dotenv/config'

// 3rd party modules
import { setRandomInterval } from '#global-utils'
import { app, apolloServerSettings, mongoSetup, models, methods } from './server/index.js'
import { ApolloServer } from 'apollo-server-express'

let { PORT = 3018, SERVER_URL } = process.env
SERVER_URL = SERVER_URL || `http://localhost:${PORT}`;

(async () => {
  await mongoSetup()
  await initApolloServer()
  await activateSchedulers({ models, methods })

  initServer()
})()

const initApolloServer = async () => {
  const apolloServer = new ApolloServer(apolloServerSettings)
  await apolloServer.start()
  apolloServer.applyMiddleware({ app, path: '/' })
}

const initServer = () => {
  const server = http.createServer(app)
  server.listen(PORT, async () => {
    console.log(`Server ready at ${SERVER_URL}`)
  })
}

const activateSchedulers = async ({ models, methods }) => {
  const schedulers = await methods.getAllSchedulers({ models })
  const defaultSchedulers = schedulers.filter(({ type }) => type === 'DEFAULT')
  const attackingSchedulers = schedulers.filter(({ type }) => type === 'ATTACK')

  defaultSchedulers.forEach(({ accountId, executionIntervalInMinutes }) => {
    setRandomInterval(() => {
      console.log('PING:default-scheduler')
      axios.get(`${SERVER_URL}/scheduler`, { headers: { account_id: accountId } })
    }, { min: (executionIntervalInMinutes - 5) * 60, max: executionIntervalInMinutes * 60 })
  })

  attackingSchedulers.forEach(({ accountId, executionIntervalInMinutes }) => {
    setRandomInterval(() => {
      console.log('PING:attack-scheduler')
      axios.get(`${SERVER_URL}/attack-scheduler`, { headers: { account_id: accountId } })
    }, { min: (executionIntervalInMinutes + 5) * 60, max: (executionIntervalInMinutes + 5) * 60 })
  })
}
