const SearchRequirement = require('../models/searchRequirement.js');
const Property = require('../models/property.js');
const redis = require('redis');
const async = require('async');

const redisClient = redis.createClient();

const getMatches = async (propertyIds, requirement) => {
  const properties = await Property.findAll({ where: { id: propertyIds } });
  return properties;
};

// End point to post a property
module.exports = async (req, res) => {
  const {
    minnoofbathrooms, maxnoofbathrooms, minnoofbedrooms, maxnoofbedrooms, minBudget, maxBudget, longitude, latitude,
  } = req.body;
  if (!longitude || !latitude) { return res.status(400).end(); }

  const requirement = await SearchRequirement.create({
    minnoofbathrooms, maxnoofbathrooms, minnoofbedrooms, maxnoofbedrooms, minBudget, maxBudget, longitude, latitude,
  });
  // no need to add await here
  redisClient.geoadd('requirements', requirement.longitude, requirement.latitude, requirement.id);
  redisClient.georadius(
    'locations', requirement.longitude, requirement.latitude, 10, 'mi',
    async (err, propertyIds) => {
      const matches = await getMatches(propertyIds, requirement);
      res.send({
        requirement,
        matches: matches || [],
      });
    },
  );
  // now-get-all search requirements within the 10km radius
};
