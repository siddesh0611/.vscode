const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const { type } = require('os');

const UserDetails = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    chatLogs: {
        type: Sequelize.STRING,
    }
});

module.exports = UserDetails;