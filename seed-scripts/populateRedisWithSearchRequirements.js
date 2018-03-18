const SearchRequirement = require('../models/searchRequirement.js');
const redis = require('redis');

const redisClient = redis.createClient();
const async = require('async');

const populateRedisWithSearchRequirements = async () => {
  const searchRequirements = await SearchRequirement.findAll({
    attributes: { exclude: ['minBudget', 'maxBudget', 'minNoOfBathrooms', 'maxnoofbathrooms', 'minNofBedrooms', 'maxNoOfBedrooms'] },
  }).map(requirement => (requirement.dataValues));

  async.each(
    searchRequirements,
    (requirement, nextRequirement) => {
      redisClient.geoadd('requirements', requirement.longitude, requirement.latitude, requirement.id);
      return nextRequirement();
    },
    (err) => {
      if (err) {
        console.log(err);
      }
      console.log('done populating redis!');
    },
  );
};
populateRedisWithSearchRequirements();

