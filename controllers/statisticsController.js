const { Author, Book } = require('../models');

const getStatistics = async (req, res,next) => {
    try {
        const authors = await Author.findAll({
            include: {
                model: Book,
                attributes: ['id', 'semester']
            },
            order: [['name', 'ASC']]
        });

        const books = await Book.findAll({
            attributes: ['id', 'semester']
        });

        const authorsCount = authors.length;
        const booksCount = books.length;

        const booksBySemester = {};

        for (let semester = 1; semester <= 8; semester++) {
            booksBySemester[semester] = 0;
        }

        books.forEach(book => {
            booksBySemester[book.semester]++;
        });

        const booksByAuthor = authors.map(author => ({
            name: author.name,
            count: author.Books.length
        }));

        let authorWithMostBooks = null;

        if (booksByAuthor.length > 0) {
            authorWithMostBooks = booksByAuthor.reduce(
                (max, author) =>
                    author.count > max.count ? author : max
            );
        }

        res.render('statistics', {
            title: 'Статистика',
            authorsCount,
            booksCount,
            booksBySemester,
            booksByAuthor,
            authorWithMostBooks
        });
    } catch (error) {
       next(error);
    }
};

module.exports = {
    getStatistics
};