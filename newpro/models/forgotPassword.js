const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const ForgotPassword = sequelize.define('forgotPassword', {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
    },
    isActive: DataTypes.BOOLEAN,
    expiresIn: DataTypes.DATE,

});

module.exports = ForgotPassword;