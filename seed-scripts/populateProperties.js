let cities = require('cities.json');
const Property = require('../models/property.js');
const redis = require('redis');

const client = redis.createClient();
const prices = [1000, 2000, 3000, 4000, 5000, 6000, 7000];
const bedrooms = [1, 2, 3, 4, 5, 6, 7];

cities = cities.map(city => ({
  price: prices[Math.floor(Math.random() * 6)],
  noofbedrooms: bedrooms[Math.floor(Math.random() * 6)],
  noofbathrooms: bedrooms[Math.floor(Math.random() * 6)],
  longitude: parseFloat(city.lng),
  latitude: parseFloat(city.lat),
}));

Property.bulkCreate((cities), { returning: true });

