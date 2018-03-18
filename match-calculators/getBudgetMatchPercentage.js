const MAX_BUDGET_MATCH_PERCENTAGE = 30;
const MAX_DELTA = 25;
const MIN_DELTA = 10;

const getBudgetMatchContribution = (delta) => {
  if (delta <= MIN_DELTA) {
    return 30;
  }
  return (MAX_BUDGET_MATCH_PERCENTAGE * MIN_DELTA) / delta;
};

module.exports = (price, minBudget, maxBudget) => {
  if (minBudget && maxBudget) {
    if (price < maxBudget && price > minBudget) {
      return MAX_BUDGET_MATCH_PERCENTAGE;
    } else if (price > maxBudget) {
      const delta = Math.abs(maxBudget - price) / maxBudget * 10.00;
      if (delta > MAX_DELTA) {
        return 0;
      }

      return getBudgetMatchContribution(delta);
    }

    const delta = Math.abs(minBudget - price) / minBudget * 10.00;
    if (delta > MAX_DELTA) {
      return 0;
    }

    return getBudgetMatchContribution(delta);
  } else if (minBudget) {
    const delta = Math.abs(minBudget - price) / minBudget * 10.00;
    if (delta > MAX_DELTA) {
      return 0;
    }
    return getBudgetMatchContribution(delta);
  }
  // only max budget is given

  const delta = Math.abs(maxBudget - price) / maxBudget * 10.00;
  if (delta > MAX_DELTA) {
    return 0;
  }

  return getBudgetMatchContribution(delta);
};
