const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const UserDetails = sequelize.define('User', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    emailId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    phoneNo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
});

module.exports = UserDetails;
