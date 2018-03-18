const SearchRequirement = require('../models/searchRequirement.js');
const Property = require('../models/property.js');
const redis = require('redis');
const redisClient = redis.createClient();
const _ = require('underscore');
const getDistanceMatchPercentage = require('../match-calculators/getDistanceMatchPercentage.js');
const getBudgetMatchPercentage = require('../match-calculators/getBudgetMatchPercentage.js');
// The logic to compute the percentage contribution is same for
// bed rooms and bath rooms and hence adding a single file.
const getBedroomMatchPercentage = require('../match-calculators/getBedRoomMatchPercentage.js');
const getBathroomMatchPercentage = require('../match-calculators/getBedRoomMatchPercentage.js');

const getMatches = async (propertiesRedisReply, requirement) => {
  const propertyDistanceMap = {};

  _.each(
    propertiesRedisReply,
    (propertyRedisArray) => {
      propertyDistanceMap[propertyRedisArray[0]] = propertyRedisArray[1];
    },
  );
  const propertyIds = propertiesRedisReply.map((propertyRedisArray => propertyRedisArray[0]));
  const properties = await Property.findAll({ where: { id: propertyIds } }).map(requirement => (requirement.dataValues));

  let matches = properties.map((property) => {
    property.distanceMatchPercent = getDistanceMatchPercentage(propertyDistanceMap[property.id]);
    property.budgetMatchPercent = getBudgetMatchPercentage(property.price, requirement.minBudget, requirement.maxBudget);
    property.budgetMatchPercent = getDistanceMatchPercentage(propertyDistanceMap[property.id]);
    property.bathroomMatchPercent = getBathroomMatchPercentage(property.noofbathrooms, requirement.minNoOfBathrooms, requirement.maxNoOfBathrooms);
    property.bedroomMatchPercent = getDistanceMatchPercentage(propertyDistanceMap[property.id]);




    property.matchPercentage = getDistanceMatchPercentage(propertyDistanceMap[property.id]);
    property.matchPercentage += getBudgetMatchPercentage(property.price, requirement.minBudget, requirement.maxBudget);
    property.matchPercentage += getBathroomMatchPercentage(property.noofbathrooms, requirement.minNoOfBathrooms, requirement.maxNoOfBathrooms);
    property.matchPercentage += getBedroomMatchPercentage(property.noofbedrooms, requirement.minNoOfBedrooms, requirement.maxNoOfBedrooms);
    return property;
  });

  matches = _.filter(matches, (match =>  match.matchPercentage > 40));
  return matches;
};

// End point to post a property
module.exports = async (req, res) => {
  const {
    minNoOfBathrooms, maxNoOfBathrooms, minNoOfBedrooms, maxNoOfBedrooms, minBudget, maxBudget, longitude, latitude,
  } = req.body;
  if (!longitude || !latitude || (!minNoOfBathrooms && !maxNoOfBathrooms) || (!minNoOfBedrooms && !maxNoOfBedrooms)) { return res.status(400).end(); }

  const requirement = await SearchRequirement.create({
    minNoOfBathrooms, maxNoOfBathrooms, minNoOfBedrooms, maxNoOfBedrooms, minBudget, maxBudget, longitude, latitude,
  });
  // no need to add await here
  redisClient.geoadd('requirements', requirement.longitude, requirement.latitude, requirement.id);

  // now-get-all search requirements within the 10km radius
  redisClient.georadius(
    'locations', requirement.longitude, requirement.latitude, 10, 'mi', 'WITHDIST',
    async (err, propertiesRedisReply) => {
      // propertiesRedisReply is an array of arrays with each array first element being the propety id and the second element being
      // the distance from the search requirement. Ex: [ [ '56549', '9.6348' ], [ '56550', '8.6498' ],...]
      const matches = await getMatches(propertiesRedisReply, requirement);
      res.send({
        requirement,
        matches: matches || [],
      });
    },
  );
};
