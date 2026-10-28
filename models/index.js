
const sequelize = require('../config/database');

const User = require('./User');
const Author = require('./author');
const Book = require('./book');
const Genre = require('./genre');
const TakenBooks = require('./takenBooks');

// Author 1:N Book
Author.hasMany(Book, {
    foreignKey: 'authorId',
    as: 'books',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

Book.belongsTo(Author, {
    foreignKey: 'authorId',
    as: 'author'
});

// Genre 1:N Book
Genre.hasMany(Book, {
    foreignKey: 'genreId',
    as: 'books',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

Book.belongsTo(Genre, {
    foreignKey: 'genreId',
    as: 'genre'
});

// User 1:N TakenBooks
User.hasMany(TakenBooks, {
    foreignKey: 'userId',
    as: 'takenBooks',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

TakenBooks.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// Book 1:N TakenBooks
Book.hasMany(TakenBooks, {
    foreignKey: 'bookId',
    as: 'borrowHistory',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

TakenBooks.belongsTo(Book, {
    foreignKey: 'bookId',
    as: 'book'
});

module.exports = {
    sequelize,
    User,
    Author,
    Book,
    Genre,
    TakenBooks
};
