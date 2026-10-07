const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },

    semester: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 8
        }
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Course;