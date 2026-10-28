
const { Author, Book } = require('../models');
const { validationResult } = require('express-validator');
const { logAdminAction } = require('../middleware/logger');
const { notifyCatalogChange } = require('../middleware/utils');

const getAuthors = async (req, res, next) => {
    try {
        const authors = await Author.findAll({
            include: [{
                model: Book,
                as: 'books',
                attributes: ['id', 'title']
            }],
            order: [['name', 'ASC']]
        });

        return res.render('authors/index', {
            title: 'Авторы',
            authors
        });
    } catch (error) {
        return next(error);
    }
};

const getCreateForm = (req, res) => {
    return res.render('authors/create', {
        title: 'Добавить автора',
        errors: [],
        formData: {}
    });
};

const addAuthor = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).render('authors/create', {
                title: 'Добавить автора',
                errors: errors.array(),
                formData: req.body
            });
        }

        const { name, born, deceased } = req.body;

        const author = await Author.create({
            name: name.trim(),
            born: born || null,
            deceased: deceased || null
        });
        notifyCatalogChange(req, 'author', 'created', author.name);
        logAdminAction(req, 'CREATE', 'AUTHOR', author.id);

        return res.redirect('/authors');
    } catch (error) {
        return next(error);
    }
};

const getAuthorById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const author = await Author.findByPk(id, {
            include: [{
                model: Book,
                as: 'books',
                attributes: ['id', 'title', 'pages', 'publicationDate', 'isTaken']
            }]
        });

        if (!author) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        return res.render('authors/details', {
            title: author.name,
            author
        });
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

        const author = await Author.findByPk(id);

        if (!author) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }
        console.log(author);
        return res.render('authors/edit', {
            title: 'Редактировать автора',
            author,
            formData: {},
            errors: []
        });
    } catch (error) {
        return next(error);
    }
};

const updateAuthor = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const author = await Author.findByPk(id);

        if (!author) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).render('authors/edit', {
                title: 'Редактировать автора',
                author: {
                    ...author.toJSON(),
                    ...req.body
                },
                errors: errors.array()
            });
        }

        const { name, born, deceased } = req.body;

        await author.update({
            name: name.trim(),
            born: born || null,
            deceased: deceased || null
        });

        notifyCatalogChange(req, 'author', 'updated', author.name);
        logAdminAction(req, 'UPDATE', 'AUTHOR', author.id);

        return res.redirect(`/authors/${author.id}`);
    } catch (error) {
        return next(error);
    }
};

const deleteAuthor = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const author = await Author.findByPk(id);

        if (!author) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const booksCount = await Book.count({
            where: { authorId: author.id }
        });

        if (booksCount > 0) {
            return res.status(409).render('error', {
                title: 'Невозможно удалить автора',
                message: 'Сначала переназначьте или удалите книги этого автора.'
            });
        }

        await author.destroy();

        notifyCatalogChange(req, 'author', 'deleted', author.name);
        logAdminAction(req, 'DELETE', 'AUTHOR', author.id);

        return res.redirect('/authors');
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getAuthors,
    getCreateForm,
    addAuthor,
    getAuthorById,
    getEditForm,
    updateAuthor,
    deleteAuthor
};
