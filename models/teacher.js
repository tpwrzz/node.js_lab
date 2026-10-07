const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Teacher = sequelize.define('Teacher', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    department: {
        type: DataTypes.STRING,
        allowNull: false
    },

    academicDegree: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Teacher;