// node core modules
import http from 'http'

// 3rd party modules

// local modules
import app from './app'
import { SERVER_PORT, SERVER_HOST } from '../constants'

const server = http.createServer(app)

server.listen(SERVER_PORT, async () => {
  console.log(`Server ready at http://${SERVER_HOST}:${SERVER_PORT}`)
})
