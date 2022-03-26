// node core modules
import http from 'http'

// local modules
import 'regenerator-runtime/runtime'
import axios from 'axios'

// 3rd party modules
import { app, mongoSetup } from './server'
import { setRandomInterval } from './utils'

(async () => {
  await mongoSetup()
  initServer()
  setupScheduler()
})()

const initServer = () => {
  const { PORT, HOST } = process.env
  const server = http.createServer(app)

  server.listen(PORT, async () => {
    console.log(`Server ready at http://${HOST}:${PORT}`)
  })
}

const setupScheduler = () => {
  const { SERVER_URL } = process.env

  setRandomInterval(() => {
    console.log('PING:scheduler')
    axios.get(`${SERVER_URL}/scheduler`)
  }, { min: 10 * 60, max: 15 * 60 })
  //
  // setInterval(() => {
  //   axios.get(`${SERVER_URL}/attack-scheduler`)
  // }, 60 * 1000)
  //
  // setInterval(() => {
  //   axios.get(`${SERVER_URL}/mass-donation`)
  // }, 2 * 60 * 60 * 1000)
}
