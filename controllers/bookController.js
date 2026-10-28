
const { Op } = require('sequelize');
const { Book, Author, Genre, TakenBooks, User } = require('../models');
const { validationResult } = require('express-validator');
const { logAdminAction } = require('../middleware/logger');
const { notifyCatalogChange } = require('../middleware/utils');

const getBooks = async (req, res, next) => {
    try {
        const { search = '', authorId = '', genreId = '', status = '' } = req.query;

        const where = {};

        if (search.trim()) {
            where.title = { [Op.iLike]: `%${search.trim()}%` };
        }

        if (authorId) {
            where.authorId = Number(authorId);
        }

        if (genreId) {
            where.genreId = Number(genreId);
        }

        if (status === 'true' || status === 'false') {
            where.isTaken = status === 'true';
        }

        const [books, authors, genres] = await Promise.all([
            Book.findAll({
                where,
                include: [
                    { model: Author, as: 'author' },
                    { model: Genre, as: 'genre' }
                ],
                order: [['title', 'ASC']]
            }),
            Author.findAll({ order: [['name', 'ASC']] }),
            Genre.findAll({ order: [['name', 'ASC']] })
        ]);

        return res.render('books/index', {
            title: 'Каталог книг',
            books,
            authors,
            genres,
            search,
            authorId,
            genreId,
            status
        });
    } catch (error) {
        return next(error);
    }
};


const getBookById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const [book, activeLoan, users] = await Promise.all([
            Book.findByPk(id, {
                include: [
                    {
                        model: Author,
                        as: 'author'
                    },
                    {
                        model: Genre,
                        as: 'genre'
                    }
                ]
            }),

            TakenBooks.findOne({
                where: {
                    bookId: id,
                    returnedAt: null
                },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }]
            }),

            req.session.user?.role === 'admin'
                ? User.findAll({
                    where: { role: 'user' },
                    attributes: ['id', 'name', 'email'],
                    order: [['name', 'ASC']]
                })
                : Promise.resolve([])
        ]);

        if (!book) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        return res.render('books/details', {
            title: book.title,
            book,
            activeLoan,
            users
        });
    } catch (error) {
        return next(error);
    }
};


const getCreateForm = async (req, res, next) => {
    try {
        const [authors, genres] = await Promise.all([
            Author.findAll({ order: [['name', 'ASC']] }),
            Genre.findAll({ order: [['name', 'ASC']] })
        ]);

        return res.render('books/create', {
            title: 'Добавить книгу',
            authors,
            genres,
            errors: [],
            formData: {}
        });
    } catch (error) {
        return next(error);
    }
};

const addBook = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        const authors = await Author.findAll({
            order: [['name', 'ASC']]
        });
        const genres = await Genre.findAll({
            order: [['name', 'ASC']]
        });

        if (!errors.isEmpty()) {
            return res.status(400).render('books/create', {
                title: 'Добавить книгу',
                errors: errors.array(),
                authors,
                genres,
                formData: req.body
            });
        }

        const { title, authorId, genreId, pages, description,
            publicationDate } = req.body;

        const [author, genre] = await Promise.all([
            Author.findByPk(Number(authorId)),
            Genre.findByPk(Number(genreId))
        ]);

        const relationshipErrors = [];

        if (!author) {
            relationshipErrors.push({
                msg: 'Выбранный автор не существует.'
            });
        }

        if (!genre) {
            relationshipErrors.push({
                msg: 'Выбранный жанр не существует.'
            });
        }

        if (relationshipErrors.length) {
            return res.status(400).render('books/create', {
                title: 'Добавить книгу',
                errors: relationshipErrors,
                authors,
                genres,
                formData: req.body
            });
        }

        const book = await Book.create({
            title: title.trim(),
            authorId: author.id,
            genreId: genre.id,
            pages: Number(pages),
            description: description.trim(),
            publicationDate
        });

        logAdminAction(req, 'CREATE', 'BOOK', book.id);

        notifyCatalogChange(req, 'book', 'created', book.title);

        return res.redirect('/books');
    } catch (error) {
        return next(error);
    }
};

const getEditForm = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const [book, authors, genres] = await Promise.all([
            Book.findByPk(id, {
                include: [
                    { model: Author, as: 'author' },
                    { model: Genre, as: 'genre' }
                ]
            }),
            Author.findAll({ order: [['name', 'ASC']] }),
            Genre.findAll({ order: [['name', 'ASC']] })
        ]);

        if (!book) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        return res.render('books/edit', {
            title: 'Редактировать книгу',
            book,
            authors,
            genres,
            errors: [],
            formData: {}
        });
    } catch (error) {
        return next(error);
    }
};

const updateBook = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const book = await Book.findByPk(id);

        if (!book) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const [authors, genres] = await Promise.all([
            Author.findAll({ order: [['name', 'ASC']] }),
            Genre.findAll({ order: [['name', 'ASC']] })
        ]);

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).render('books/edit', {
                title: 'Редактировать книгу',
                book: { ...book.toJSON(), ...req.body },
                authors,
                genres,
                errors: errors.array()
            });
        }

        const { title, authorId, genreId, pages, description,
            publicationDate } = req.body;

        const [author, genre] = await Promise.all([
            Author.findByPk(Number(authorId)),
            Genre.findByPk(Number(genreId))
        ]);

        const relationshipErrors = [];

        if (!author) {
            relationshipErrors.push({
                msg: 'Выбранный автор не существует.'
            });
        }

        if (!genre) {
            relationshipErrors.push({
                msg: 'Выбранный жанр не существует.'
            });
        }

        if (relationshipErrors.length) {
            return res.status(400).render('books/edit', {
                title: 'Редактировать книгу',
                book: { ...book.toJSON(), ...req.body },
                authors,
                genres,
                errors: relationshipErrors
            });
        }

        await book.update({
            title: title.trim(),
            authorId: author.id,
            genreId: genre.id,
            pages: Number(pages),
            description: description.trim(),
            publicationDate
        });

        logAdminAction(req, 'UPDATE', 'BOOK', book.id);

        notifyCatalogChange(req, 'book', 'updated', book.title);
        return res.redirect(`/books/${book.id}`);
    } catch (error) {
        return next(error);
    }
};

const deleteBook = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const book = await Book.findByPk(id);

        if (!book) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const historyCount = await TakenBooks.count({
            where: { bookId: book.id }
        });

        if (historyCount > 0) {
            return res.status(409).render('error', {
                title: 'Невозможно удалить книгу',
                message: 'У книги есть история выдачи. Удаление запрещено.'
            });
        }

        await book.destroy();

        logAdminAction(req, 'DELETE', 'BOOK', book.id);

        notifyCatalogChange(req, 'book', 'deleted', book.title);
        return res.redirect('/books');
    } catch (error) {
        return next(error);
    }
};

const borrowBook = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const book = await Book.findByPk(id);

        if (!book) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const user = await User.findByPk(req.session?.user?.id);
        if (!user) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }
        await book.update({
            title: book.title.trim(),
            authorId: book.authorId,
            genreId: book.genreId,
            pages: Number(book.pages),
            description: book.description.trim(),
            publicationDate: book.publicationDate,
            isTaken: true
        });

        TakenBooks.create({
            bookId: book.id,
            userId: user.id,
            borrowedAt: new Date(),
            returnedAt: null
        });

        logAdminAction(req, 'UPDATE', 'BOOK', book.id);
        logAdminAction(req, 'BORROWED', 'BOOK', book.id);

        return res.redirect('/books');
    } catch (error) {
        return next(error);
    }
};

const returnBook = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const book = await Book.findByPk(id);

        const user = await User.findByPk(req.session?.user?.id);
        if (!user) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }
        await book.update({
            title: book.title.trim(),
            authorId: book.authorId,
            genreId: book.genreId,
            pages: Number(book.pages),
            description: book.description.trim(),
            publicationDate: book.publicationDate,
            isTaken: false
        });

        const takenBooksRow = await TakenBooks.findOne({ bookId: book.id, userId: user.id, returnedAt: null });

        await TakenBooks.create({
            bookId: book.id,
            userId: user.id,
            borrowedAt: takenBooksRow.borrowedAt,
            returnedAt: new Date()
        });

        logAdminAction(req, 'UPDATE', 'BOOK', book.id);
        logAdminAction(req, 'RETURNED', 'BOOK', book.id);

        return res.redirect('/books');
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getBooks,
    getCreateForm,
    getBookById,
    getEditForm,
    addBook,
    updateBook,
    deleteBook,
    borrowBook,
    returnBook
};
