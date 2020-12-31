// Setup empty JS object to act as endpoint for all routes
projectData = {};

// Require Express to run server and routes
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv')
const cors = require('cors');

// Start up an instance of app
const app = express();
const port = 8080;

// Load API keys
dotenv.config();
const apiKey = process.env.API_KEY
console.log('Your API key is ', apiKey)

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
app.use(cors());

// Initialize the main project folder
app.use(express.static('dist'));

// Return projectData
app.get('/journal-entries', function (req, res) {
  res.send(projectData);
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
  });
})

function listening() {
  console.log("server running");
  console.log(`running on localhost: {$port}`);
}

// Setup Server
const server = app.listen(port, () => { console.log(`running on localhost: ${port}`) })
