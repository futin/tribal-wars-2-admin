require('dotenv/config')
/* eslint-disable import/first */

// node core modules

import http from 'http'

// local modules
import app from './app'

// 3rd party modules

const { PORT, HOST } = process.env
const server = http.createServer(app)

server.listen(PORT, async () => {
  console.log(`Server ready at http://${HOST}:${PORT}`)
})
