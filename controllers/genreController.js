const { Genre, Book } = require('../models');
const { validationResult } = require('express-validator');
const { logAdminAction } = require('../middleware/logger');
const { notifyCatalogChange } = require('../middleware/utils');

const getGenres = async (req, res, next) => {
    console.log('Fetching genres...');
    try {
        const genres = await Genre.findAll({
            include: [{
                model: Book,
                as: 'books',
                attributes: ['id', 'title']
            }],
            order: [['name', 'ASC']]
        });

        return res.render('genres/index', {
            title: 'Жанры',
            genres
        });
    } catch (error) {
        return next(error);
    }
};

const getCreateForm = (req, res) => {
    return res.render('genres/create', {
        title: 'Добавить жанр',
        errors: [],
        formData: {}
    });
};

const addGenre = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).render('genres/create', {
                title: 'Добавить жанр',
                errors: errors.array(),
                formData: req.body
            });
        }

        const genre = await Genre.create({
            name: req.body.name.trim()
        });

        logAdminAction(req, 'CREATE', 'GENRE', genre.id);

        notifyCatalogChange(req, 'genre', 'created', genre.name);
        return res.redirect('/genres');
    } catch (error) {
        return next(error);
    }
};

const getGenreById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const genre = await Genre.findByPk(id, {
            include: [{
                model: Book,
                as: 'books'
            }]
        });

        if (!genre) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        return res.render('genres/details', {
            title: genre.name,
            genre
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

        const genre = await Genre.findByPk(id);

        if (!genre) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        return res.render('genres/edit', {
            title: 'Редактировать жанр',
            genre,
            errors: [],
            formData: {}
        });
    } catch (error) {
        return next(error);
    }
};

const updateGenre = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const genre = await Genre.findByPk(id);

        if (!genre) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).render('genres/edit', {
                title: 'Редактировать жанр',
                genre: {
                    ...genre.toJSON(),
                    ...req.body
                },
                errors: errors.array()
            });
        }

        await genre.update({
            name: req.body.name.trim()
        });

        logAdminAction(req, 'UPDATE', 'GENRE', genre.id);

        notifyCatalogChange(req, 'genre', 'updated', genre.name);

        return res.redirect(`/genres/${genre.id}`);
    } catch (error) {
        return next(error);
    }
};

const deleteGenre = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const genre = await Genre.findByPk(id);

        if (!genre) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const booksCount = await Book.count({
            where: { genreId: genre.id }
        });

        if (booksCount > 0) {
            return res.status(409).render('error', {
                title: 'Невозможно удалить жанр',
                message: 'Сначала назначьте книгам другой жанр или удалите эти книги.'
            });
        }

        await genre.destroy();

        logAdminAction(req, 'DELETE', 'GENRE', genre.id);

        notifyCatalogChange(req, 'genre', 'deleted', genre.name);
        return res.redirect('/genres');
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getGenres,
    getCreateForm,
    addGenre,
    getGenreById,
    getEditForm,
    updateGenre,
    deleteGenre
};
