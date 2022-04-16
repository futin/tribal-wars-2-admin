// node core modules

// 3rd party modules

// local modules

const getMassDonationMiddleware = ({ methods, auth }) => (req, res) => {
  methods.activateMassDonation({ config: { percentage: 20, auth } })

  res.end('Done')
}

const massDonationConfig = {
  method: 'get',
  routeName: '/mass-donation',
  middleware: getMassDonationMiddleware
}

export default massDonationConfig
