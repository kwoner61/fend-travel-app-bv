// API URLs
const geonamesUrl = 'http://api.geonames.org/searchJSON'
const weatherbitUrl = 'https://api.weatherbit.io/v2.0/forecast/daily'
const pixabayUrl = 'https://pixabay.com/api'
const defaultPicUrl = 'https://pixabay.com/get/57e1d14a485aa514f1dc8460c6213f7c1d36dbec4e507748752b79d09045c5_640.jpg'

// Require Express to run server and routes
const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const cors = require('cors')
const axios = require('axios')
const assert = require('assert')
const countries = require('i18n-iso-countries')

// Start up an instance of app
const app = express()

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

// Entry point for handling client's requests
app.get('/voyage/:cityName', async (req, res) => {
  let respObj = {}
  const cityName = req.params.cityName
  const startDate = Date.parse(req.query.startdate)
  const endDate = Date.parse(req.query.enddate)
  const countryName = req.query.countryname
  console.log(startDate + ':' + endDate + ':' + cityName + ':' + countryName)

  try {
    const coordinates = await getGeoLocation(cityName, countryName)
    assert(coordinates, 'Unable to retrieve coordinates for given city.')
    console.log('coords: ', coordinates.lng, coordinates.lat)

    const weatherData = await getWeatherData(coordinates.lng, coordinates.lat)
    assert(weatherData, 'Unable to retrieve weather forecast for given city.')
    console.log('weatherbit: ', weatherData.city, weatherData.country_code)
    respObj.weather = weatherData

    respObj.picUrl = await getPicUrlFromPixabay(cityName, countryName)

  } catch (error) {
    respObj.message = 'error /voyage/ ' + error
  } finally {
    respObj.message = 'OK!'
    res.status(200).send(respObj)
  }
})

// Call Geonames API to get the coordinate for given city and country
const getGeoLocation = ((cityName, countryName = '') => {
  return axios.get(geonamesUrl, {
    params: {
      q: cityName,
      maxRows: 1,
      username: geonamesApiKey,
      country: countries.getAlpha2Code(countryName, 'en')
    }
  })
  .then((resp) => {
    if (resp.data.totalResultsCount == 0) {
      console.log('Unable to find location from geonames')
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

// Call Weatherbit API to get weather forecast for given location
const getWeatherData = ((lng, lat) => {
  let returnObj = {
    city: '',
    country_code: '',
    forecastList: []
  }
  return axios.get(weatherbitUrl, {
    params: {
      lon: lng,
      lat: lat,
      key: weatherbitApiKey,
      units: 'I', // TODO: Parameterize this
      days: 16
    }
  })
  .then((resp) => {
    assert(resp.data.data.length > 0, 'No weather forecast received!')
    const weatherData = resp.data.data

    returnObj.city = resp.data.city_name
    returnObj.country_code = resp.data.country_code

    weatherData.forEach(forecast => {
      returnObj.forecastList.push({
        date: forecast.valid_date,
        weather_icon: forecast.weather.icon,
        description: forecast.weather.description,
        max_temp: forecast.max_temp,
        min_temp: forecast.min_temp,
        chance_of_precip: forecast.pop,
        precip_amount: forecast.precip,
        snow_amount: forecast.snow,
        snow_depth: forecast.snow_depth
      })
    })

    return returnObj
  })
  .catch((err) => {
    console.log('error !! from weatherbit: ', err)
    return null
  })
})

// Search for an image matching city and country name from Pixabay
// Return the URL to the image
const getPicUrlFromPixabay = ((cityName, countryName = '') => {

  const qValue = (cityName + ' ' + countryName).trim()
  console.log('Pixabay q value = ', qValue)
  return axios.get(pixabayUrl, {
    params: {
      q: qValue,
      image_type: 'photo',
      orientation: 'horizontal',
      category: 'places', // travel
      per_page: 3, // Minimum is 3
      key: pixabayApiKey
    }
  })
  .then((resp) => {
    const imgSearchResults = resp.data.hits
    if (imgSearchResults.length > 0) {
      return resp.data.hits[0].webformatURL
    } else {
      return defaultPicUrl
    }
  })
  .catch((err) => {
    console.log('error !! from pixabay: ', err)
    return null
  })
})

module.exports = app
