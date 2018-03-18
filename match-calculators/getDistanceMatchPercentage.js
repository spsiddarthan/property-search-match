const MAX_DISTANCE_MATCH_PERCENTAGE = 30;
const MIN_DISTANCE = 2;
module.exports = (distance) => {
  if (distance <= MIN_DISTANCE) {
    return 30;
  }
  return (MAX_DISTANCE_MATCH_PERCENTAGE * MIN_DISTANCE) / distance;
};
