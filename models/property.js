const dbConn = require('../dbConn.js');
const Sequelize = require('sequelize');

const Property = dbConn.define('Property', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  price: {
    type: Sequelize.INTEGER,
    notNull: true,
  },
  noofbathrooms: {
    type: Sequelize.INTEGER,
    notNull: true,
  },
  noofbedrooms: {
    type: Sequelize.INTEGER,
    notNull: true,
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
// dbConn.sync({force: true});
module.exports = Property;

