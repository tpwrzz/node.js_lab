
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 255]
        }
    },

    genreId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    pages: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1
        }
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },

    publicationDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true
        }
    },

    isTaken: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Book;
