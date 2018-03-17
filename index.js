const express = require('express');

const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  next();
});
app.listen(5000, () => {
  console.log('the api is listening on port 5000!');
});

const propertyPostHandler = require('./routeHandlers/propertyPostHandler.js');
const searchRequirementPostHandler = require('./routeHandlers/searchRequirementPostHandler.js');

// end point to post a todo item
app.post('/property', propertyPostHandler);
app.post('/search-requirement', searchRequirementPostHandler);
