const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Expense = sequelize.define('expense', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    expenseName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expenseAmount: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
});

module.exports = Expense;
