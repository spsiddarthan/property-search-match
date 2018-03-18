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
  minNoOfBathrooms: {
    type: Sequelize.INTEGER,
  },
  maxNoOfBathrooms: {
    type: Sequelize.INTEGER,
  },
  minNoOfBedrooms: {
    type: Sequelize.INTEGER,
  },
  maxNoOfBedrooms: {
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

