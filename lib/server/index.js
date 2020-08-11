require('dotenv/config')
// node core modules

/* eslint-disable import/first */
import http from 'http'

// local modules
import app from './app'
import { SERVER_PORT, SERVER_HOST } from '../constants'

// 3rd party modules

const server = http.createServer(app)

server.listen(SERVER_PORT, async () => {
  console.log(`Server ready at http://${SERVER_HOST}:${SERVER_PORT}`)
})
