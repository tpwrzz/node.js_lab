
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TakenBooks = sequelize.define('TakenBooks', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    bookId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    borrowedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    returnedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
});

module.exports = TakenBooks;
