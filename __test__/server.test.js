const request = require('supertest')
const moxios = require('moxios')
const app = require('../src/server/app')
const assert = require('assert')

describe('Test the Express app functions', () => {
  
  beforeEach(() => {
    moxios.install()
    moxios.stubRequest(/api.geonames.org/, {
      status: 200,
      response: geoData
    })
    moxios.stubRequest(/api.weatherbit.io/, {
      status: 200,
      response: weatherData
    })
    moxios.stubRequest(/pixabay.com/, {
      status: 200,
      response: pixabayData
    })
  })

  afterEach(() => {
    moxios.uninstall()
  })

  test('App should exist', () => {
    expect(app).toBeTruthy()
  })

  test('App should run handler for main entrypoint', async (done) => {

    const reqPath = '/voyage/paris?startdate=1-22-2021&enddate=1-30-2021&countryname=France'

    // supertest via a Promise
    const resp = await request(app).get(reqPath)
    const result = resp.body
    assert(result.weather.city == weatherData.city_name)
    assert(result.weather.country_code == weatherData.country_code)
    assert(result.weather.forecastList[0].weather_icon ==
      weatherData.data[0].weather.icon)
    assert(result.picUrl == pixabayData.hits[0].webformatURL)
    
    // Let Jest know we're done
    done()
  }) // End of test
}) // End of describe

const geoData = {
  totalResultsCount: 1,
  geonames: [
    {
      lng: 0,
      lat: 0,
    },
  ],
};

const weatherData = {
  city_name: 'New York',
  country_code: 'US',
  data: [{
    valid_date: '2021-01-10',
    weather: { icon: 'c03d', description: 'Broken clouds' },
    max_temp: 33.7,
    min_temp: 22.4,
    pop: 0,
    precip: 0,
    snow_amount: 0,
    snow_depth: 0
  }]
}

const pixabayData = {
  hits: [
    {
      webformatURL: "https://example.com/test.png"
    }
  ]
}
