// Setup empty JS object to act as endpoint for all routes
projectData = {}

// API URLs
const geonamesUrl = 'http://api.geonames.org/searchJSON'
const weatherbitUrl = 'https://api.weatherbit.io/v2.0/forecast/daily'
const pixabayUrl = 'https://pixabay.com/api'

// Require Express to run server and routes
const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const cors = require('cors')
const axios = require('axios')
const assert = require('assert')

// Start up an instance of app
const app = express()
const port = 8080

// Load API keys
dotenv.config()
const geonamesApiKey = process.env.GEONAMES_USER
const weatherbitApiKey = process.env.WEATHERBIT_API_KEY
const pixabayApiKey = process.env.PIXABAY_API_KEY
console.log('Geonames API Key is ', geonamesApiKey)
console.log('Weatherbit API Key is ', weatherbitApiKey)
console.log('Pixabay API Key is ', pixabayApiKey)

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Cors for cross origin allowance
app.use(cors())

// Initialize the main project folder
app.use(express.static('dist'))

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
// Entry point for handling client's requests
// Example request path = /voyage/paris?startdate=1/23/2021&enddate=1/30/2021
app.get('/voyage/:cityName', async (req, res) => {

  let respObj = {
    message: '',
    data: {},
    errors: []
  }

  const cityName = req.params.cityName
  const startDate = Date.parse(req.query.startdate)
  const endDate = Date.parse(req.query.enddate)
  const countryName = req.query.countryname

  console.log('startDate ', startDate)
  console.log('endDate ', endDate)
  //console.log('cityName ', cityName)
  //console.log('countryName ', countryName)

  try {
    const coordinates = await getGeoLocation(cityName)
    assert(coordinates, 'Unable to retrieve coordinates for given city.')
    //console.log('coords: ', coordinates.lng, coordinates.lat)

    const weatherData = await getWeatherForecast(coordinates.lng, coordinates.lat)
    assert(weatherData, 'Unable to retrieve weather forecast for given city.')

    respObj.data = weatherData
  } catch (error) {
    respObj.message = 'error /voyage/ ' + error
  } finally {
    
    res.status(200).send(respObj)
  }

  
})


const getGeoLocation = ((cityName) => {
  return axios.get(geonamesUrl, {
    params: {
      q: cityName,
      maxRows: 1,
      username: geonamesApiKey,
      //country: req.query.country  // TODO: use pycountry here to convert country name to ISO-3166 (country codes)
    }
  })
  .then((resp) => {
    //console.log('response from geonames: ', resp)

    if (resp.data.totalResultsCount == 0) {
      respObj.message = 'I wasn\'t able to find the city.'
      return null
    }
    return {
      lng: resp.data.geonames[0].lng,
      lat: resp.data.geonames[0].lat
    }
  })
  .catch((err) => {
    console.log('error !! from geonames: ', err)
    return null
  })
})

const getWeatherForecast = ((lng, lat) => {
  return axios.get(weatherbitUrl, {
    params: {
      lon: lng,
      lat: lat,
      key: weatherbitApiKey,
      units: 'I', // TODO: Parameterize this
      days: 1
    }
  })
  .then((resp) => {
    // console.log('response from weatherbit: ', resp.data)
    assert(resp.data.data, 'No weather forecast!')
    const weatherForecastList = resp.data.data

    return weatherForecastList
  })
  .catch((err) => {
    console.log('error !! from weatherbit: ', err)
    return null
  })
})


// Return projectData
app.get('/journal-entries', function (req, res) {
  res.send(projectData)
})

// Add to projectData
app.post('/journal-entries', function (req, res) {
  projectData = {
    temperature: req.body.temperature,
    date: req.body.date,
    userResponse: req.body.userResponse
  }
  res.status(201).send({
    message: 'Added new entry on' + projectData.date
  })
})

function listening() {
  console.log("server running")
  console.log(`running on localhost: {$port}`)
}

// Setup Server
const server = app.listen(port, () => { console.log(`running on localhost: ${port}`) })
