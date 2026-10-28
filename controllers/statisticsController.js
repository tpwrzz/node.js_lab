const { sequelize, Author, Book, Genre } = require('../models');

const getStatistics = async (req, res, next) => {
    try {
        const [
            booksCount,
            availableBooksCount,
            takenBooksCount,
            authorsCount,
            genresCount,
            booksByGenre,
            booksByAuthor
        ] = await Promise.all([
            Book.count(),
            Book.count({ where: { isTaken: false } }),
            Book.count({ where: { isTaken: true } }),
            Author.count(),
            Genre.count(),

            Genre.findAll({
                attributes: [
                    'id',
                    'name',
                    [
                        sequelize.fn('COUNT', sequelize.col('books.id')),
                        'count'
                    ]
                ],
                include: [{
                    model: Book,
                    as: 'books',
                    attributes: []
                }],
                group: ['Genre.id'],
                order: [['name', 'ASC']]
            }),

            Author.findAll({
                attributes: [
                    'id',
                    'name',
                    [
                        sequelize.fn('COUNT', sequelize.col('books.id')),
                        'count'
                    ]
                ],
                include: [{
                    model: Book,
                    as: 'books',
                    attributes: []
                }],
                group: ['Author.id'],
                order: [['name', 'ASC']]
            })
        ]);

        const formattedBooksByGenre = booksByGenre.map(genre => ({
            name: genre.name,
            count: Number(genre.get('count'))
        }));

        const formattedBooksByAuthor = booksByAuthor.map(author => ({
            name: author.name,
            count: Number(author.get('count'))
        }));

        const authorWithMostBooks = formattedBooksByAuthor.length > 0
            ? formattedBooksByAuthor.reduce((max, author) =>
                author.count > max.count ? author : max
            )
            : null;

        return res.render('statistics', {
            title: 'Статистика библиотеки',
            booksCount,
            availableBooksCount,
            takenBooksCount,
            authorsCount,
            genresCount,
            booksByGenre: formattedBooksByGenre,
            booksByAuthor: formattedBooksByAuthor,
            authorWithMostBooks
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getStatistics
};