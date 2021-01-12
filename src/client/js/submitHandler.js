const PORT = 8080 // TODO: Parameterize this

const serverUrl = `http://localhost:${PORT}/voyage`

const axios = require('axios')
const assert = require('assert')

const onGenerate = async () => {
  const userData = readForm()
  assert(userData)
  console.log(userData.city, userData.country, userData.start_date, userData.end_date)

  if (userData.city) {
    const reqPath = serverUrl + '/' + userData.city.trim()
    await axios.get(reqPath, {
      params: {
        countryname: userData.country || ''
      }
    })
    .then((resp) => {
      console.log(resp.data)
      updateView(resp.data, userData.start_date, userData.end_date)
    })
    .catch(err => {
      alert('Server returned an error or is not reachable!')
    })
  }

}

const readForm = () => {
  const city = document.getElementById('city').value
  const country = document.getElementById('country').value
  const startDate = document.getElementById('start').value
  const endDate = document.getElementById('end').value
  
  if (city && startDate && endDate) {
    return {
      city: city,
      country: country,
      start_date: startDate,
      end_date: endDate
    }
  } else {
    alert('City name, start date and end date are required!')
    return null
  }

}

const clearForm = () => {
  document.getElementById('city').value = null
  document.getElementById('country').value = null
  document.getElementById('start').value = null
  document.getElementById('end').value = null
}

const updateView = (serverData, startDate, endDate) => {
  
  const tripDays = 1 + ((Date.parse(endDate) - Date.parse(startDate)) / 1000 / 60 / 60 / 24)
  const tripUntil = Math.round(1 + ((Date.parse(startDate) - Date.now()) / 1000 / 60 / 60 / 24))

  document.getElementById('destination').innerHTML = `<h1>${serverData.weather.city}</h1>`
  document.getElementById('date').innerHTML = `${startDate} to ${endDate}`
  document.getElementById('image-holder').setAttribute('src', serverData.picUrl)
  document.getElementById('image-holder').style.display = 'block'
  document.getElementById('trip-duration').innerHTML = 'Trip is for ' + tripDays + ' days.'
  document.getElementById('trip-until').innerHTML = 'Trip is ' + tripUntil + ' days away.'
  document.getElementById('weather').innerHTML = `The weather in ${serverData.weather.city} today shows ` + serverData.weather.forecastList[0].description + '.'
  clearForm()

  document.getElementById('grid-below').style.display = 'grid';


}

const scrollToBottom = () => {
  document.getElementById("weather").scrollIntoView({
    behavior: 'smooth', 
    block: 'end'
  })
}

export { onGenerate, scrollToBottom }
