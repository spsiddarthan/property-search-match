const Property = require('../models/property.js');
const SearchRequirement = require('../models/searchRequirement.js');
const redis = require('redis');

const redisClient = redis.createClient();
const getMatches = async (requirementIds, property) => {
  const requirements = await SearchRequirement.findAll({ where: { id: requirementIds } });
  return requirements;
};

// End point to post an property
module.exports = async (req, res) => {
  const {
    price, noofbathrooms, noofbedrooms, longitude, latitude,
  } = req.body;
  if (!price || !noofbathrooms || !noofbedrooms || !longitude || !latitude) { return res.status(400).end(); }

  const property = await Property.create({
    price, noofbathrooms, noofbedrooms, longitude, latitude,
  });
  redisClient.geoadd('locations', property.longitude, property.latitude, property.id);

  redisClient.georadius('requirements', property.longitude, property.latitude, 10, 'mi', async (err, requirementIds) => {
    const matches = await getMatches(requirementIds, property);
    res.send({
      property,
      matches: matches || [],
    });
  });
};
