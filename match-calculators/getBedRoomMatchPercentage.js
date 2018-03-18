const MAX_MATCH_PERCENTAGE = 20;
const MAX_DELTA = 2;
// The logic to compute the percentage contribution is same for
// bed rooms and bath rooms and hence adding a single file.

const getMatchContribution = (delta) => {
  if (delta === 0) {
    // there is a match with the min/max number of rooms.
    return 20;
  }
  if (delta === 1) {
    // the delta is 1, so returning an assumed value of 10% match
    return 10;
  } else if (delta === 2) {
    // the delta is 1, so returning an assumed value of 5% match
    return 5;
  }
  return 0;
};

module.exports = (numberofRooms, minNoOfRooms, maxNoOfRooms) => {
  if (minNoOfRooms && maxNoOfRooms) {
    if (numberofRooms < maxNoOfRooms && numberofRooms > minNoOfRooms) {
      return MAX_MATCH_PERCENTAGE;
    } else if (numberofRooms > maxNoOfRooms) {
      const delta = Math.abs(maxNoOfRooms - numberofRooms);
      if (delta > MAX_DELTA) {
        return 0;
      }
      return getMatchContribution(delta);
    }

    const delta = Math.abs(minNoOfRooms - numberofRooms);
    if (delta > MAX_DELTA) {
      return 0;
    }

    return getMatchContribution(delta);
  } else if (minNoOfRooms) {
    const delta = Math.abs(minNoOfRooms - numberofRooms);
    if (delta > MAX_DELTA) {
      return 0;
    }

    return getMatchContribution(delta);
    return getMatchContribution(delta);
  }
  // only max budget is given

  const delta = Math.abs(maxNoOfRooms - numberofRooms);
  if (delta > MAX_DELTA) {
    return 0;
  }

  return getMatchContribution(delta);
};
