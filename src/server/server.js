// Set port number
require('dotenv').config()
const port = process.env.PORT || 8080

// Setup Server
require('./app').listen(port, () => {
  console.log(`running on localhost: ${port}`)
})
