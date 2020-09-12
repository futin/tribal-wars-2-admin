// node core modules

// 3rd party modules

// local modules

const getHealthMiddleware = () => (req, res) => {
  res.end('OK')
}

const healthConfig = {
  method: 'get',
  routeName: '/health',
  middleware: getHealthMiddleware
}

export default {
  healthConfig
}
