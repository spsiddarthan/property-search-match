const dbConn = require('../dbConn.js');
const Sequelize = require('sequelize');

const SearchRequirement = dbConn.define('SearchRequirement', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  minBudget: {
    type: Sequelize.INTEGER,
  },
  maxBudget: {
    type: Sequelize.INTEGER,
  },
  minnofbathrooms: {
    type: Sequelize.INTEGER,
  },
  maxnofbathrooms: {
    type: Sequelize.INTEGER,
  },
  minnofbedrooms: {
    type: Sequelize.INTEGER,
  },
  maxnofbedrooms: {
    type: Sequelize.INTEGER,
  },
  longitude: {
    type: Sequelize.DOUBLE,
    notNull: true,
  },
  latitude: {
    type: Sequelize.DOUBLE,
    notNull: true,
  },

}, {
  timestamps: false,
});
//dbConn.sync({force: true});
module.exports = SearchRequirement;

