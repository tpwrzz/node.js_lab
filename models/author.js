const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Author = sequelize.define('Author', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    born: {
        type: DataTypes.DATE,
        allowNull: false
    },

    deceased: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
});

module.exports = Author;