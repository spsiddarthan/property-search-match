const Property = require('../models/property.js');
const redis = require('redis');

const redisClient = redis.createClient();
const async = require('async');

const populateRedisWithProperties = async () => {
  const properties = await Property.findAll({
    attributes: { exclude: ['price', 'noofbedrooms', 'noofbathrooms'] },
  }).map(property => (property.dataValues));

  async.each(
    properties,
    (property, nextProperty) => {
      redisClient.geoadd('locations', property.longitude, property.latitude, property.id);
      return nextProperty();
    },
    (err) => {
      if (err) {
        console.log(err);
      }
      console.log('done populating redis!');
    },
  );
};
populateRedisWithProperties();

