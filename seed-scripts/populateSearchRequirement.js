const cities = require('cities.json');
const SearchRequirement = require('../models/searchRequirement.js');

// setting a random list of prices and number of bedrooms and bathrooms
// undefined would be used for the cases where there is no minBudget, maxBudget, minnoofbedroom etc
const prices = [undefined, 1000, 2000, 3000, 4000, 0, 5000, 6000, 7000, 0, 5500, 4500];
const bedrooms = [undefined, 1, 2, 3, 4, 0, 5, 6, 7, 8, 9, 10];

const searchRequirements = cities.map((city) => {
  // select any value from the prices array
  // TODO: REMOVE HARDCODED VALUE - add more comments
  const minBudget = prices[Math.floor(Math.random() * 11)];
  // if there is no minBudget, maxBudget is compulsory
  const maxBudget = minBudget ?
    prices[Math.floor(Math.random() * 11)] : prices[Math.floor(Math.random() * 10) + 1];

  const minnofbedrooms = bedrooms[Math.floor(Math.random() * 11)];
  const maxnofbedrooms = minnofbedrooms ?
    bedrooms[Math.floor(Math.random() * 11)] : bedrooms[Math.floor(Math.random() * 10) + 1];

  const minnofbathrooms = bedrooms[Math.floor(Math.random() * 11)];
  const maxnofbathrooms = minnofbathrooms ?
    bedrooms[Math.floor(Math.random() * 11)] : bedrooms[Math.floor(Math.random() * 10) + 1];


  return {
    longitude: parseFloat(city.lng),
    latitude: parseFloat(city.lat),
    minBudget,
    maxBudget,
    minnofbedrooms,
    maxnofbedrooms,
    minnofbathrooms,
    maxnofbathrooms,
  };
});

// Since the size of the array was too large, the bulk operations was timeing out
// hence dividing into two arrays
SearchRequirement.bulkCreate(searchRequirements.slice(0, 100000), { returning: true });
SearchRequirement.bulkCreate(
  searchRequirements.slice(100000, searchRequirements.length),
  { returning: true },
);

