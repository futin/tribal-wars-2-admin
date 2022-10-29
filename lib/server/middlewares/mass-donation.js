// node core modules

// 3rd party modules

// local modules

const getMassDonationMiddleware = ({ methods }) => (req, res) => {
  const { auth } = req
  if (!auth) {
    console.log('getMassDonationMiddleware(): Missing auth')
    return
  }

  methods.activateMassDonation({ config: { percentage: 20, auth } })

  res.end('Done')
}

const massDonationConfig = {
  method: 'get',
  routeName: '/mass-donation',
  middleware: getMassDonationMiddleware
}

export default massDonationConfig
