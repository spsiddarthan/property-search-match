const Property = require('../models/property.js');
const SearchRequirement = require('../models/searchRequirement.js');
const redis = require('redis');
const config = require('../config.js')
const redisClient = redis.createClient(config.redisPort, config.redisHost);
const _ = require('underscore');
const getDistanceMatchPercentage = require('../match-calculators/getDistanceMatchPercentage.js');
const getBudgetMatchPercentage = require('../match-calculators/getBudgetMatchPercentage.js');
// The logic to compute the percentage contribution is same for
// bed rooms and bath rooms and hence adding a single file.
const getBedroomMatchPercentage = require('../match-calculators/getBedRoomMatchPercentage.js');
const getBathroomMatchPercentage = require('../match-calculators/getBedRoomMatchPercentage.js');

const getMatches = async (requirementsRedisReply, property) => {
  const requirementDistanceMap = {};

  _.each(
    requirementsRedisReply,
    (requirementsRedisArray) => {
      requirementDistanceMap[requirementsRedisArray[0]] = requirementsRedisArray[1];
    },
  );
  const requirementIds = requirementsRedisReply.map((requirementsRedisArray => requirementsRedisArray[0]));
  const searchRequirements = await SearchRequirement.findAll({ where: { id: requirementIds } }).map(requirement => (requirement.dataValues));

  let matches = searchRequirements.map((requirement) => {
    requirement.matchPercentage = getDistanceMatchPercentage(requirementDistanceMap[requirement.id]);
    requirement.matchPercentage += getBudgetMatchPercentage(property.price, requirement.minBudget, requirement.maxBudget);
    requirement.matchPercentage += getBathroomMatchPercentage(property.noofbathrooms, requirement.minnofbathrooms, requirement.maxnofbathrooms);
    requirement.matchPercentage += getBedroomMatchPercentage(property.noofbedrooms, requirement.minnofbedrooms, requirement.maxnofbedrooms);
    return requirement;
  });

  matches = _.filter(matches, (match =>  match.matchPercentage > 40));
  return matches;
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

  //get all requirements within a 10 mile radius
  redisClient.georadius('requirements', property.longitude, property.latitude, 10, 'mi',
  'WITHDIST',
   async (err, requirementsRedisReply) => {
    const matches = await getMatches(requirementsRedisReply, property);
    res.send({
      property,
      matches: matches || [],
    });
  });
};
