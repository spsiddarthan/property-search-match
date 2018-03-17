const Sequelize = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(`postgres://${config.dbUsername}:${config.dbPassword}@${config.dbHost}:${config.dbPort}/${config.dbName}`);
module.exports = sequelize;
