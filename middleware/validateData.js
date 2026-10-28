const { body, validationResult } = require('express-validator');
const { Author, Book, Genre } = require('../models');

const normalizeName = value =>
    String(value ?? '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLocaleLowerCase();

async function isUnique(Model, field, value, req) {
    const normalizedValue = normalizeName(value);
    const records = await Model.findAll({
        attributes: ['id', field]
    });

    const currentId = req.params.id || req.body.id;

    return !records.some(record =>
        String(record.id) !== String(currentId ?? '') &&
        normalizeName(record[field]) === normalizedValue
    );
}

const validateRegistration = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Имя должно содержать от 2 до 100 символов'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Введите корректный email'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Пароль должен содержать минимум 8 символов'),

    body('confirmPassword')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Пароли не совпадают')
];

const validateLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Введите корректный email'),

    body('password')
        .notEmpty()
        .withMessage('Введите пароль')
];

const validateAuthor = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Имя автора должно содержать от 2 до 100 символов')
        .bail()
        .matches(/^[\p{L}\p{M}\s'’\-]+$/u)
        .withMessage(
            'Имя автора может содержать буквы, диакритические знаки, пробелы, дефисы и апострофы'
        )
        .bail()
        .custom(async (value, { req }) => {
            if (!(await isUnique(Author, 'name', value, req))) {
                throw new Error('Автор с таким именем уже существует');
            }
            return true;
        }),

    body('born')
        .optional({ checkFalsy: true })
        .isInt({ min: 1, max: new Date().getFullYear() })
        .withMessage('Укажите корректный год рождения'),

    body('deceased')
        .optional({ checkFalsy: true })
        .isInt({ min: 1, max: new Date().getFullYear() })
        .withMessage('Укажите корректный год смерти')
        .bail()
        .custom((value, { req }) => {
            if (!value || !req.body.born) return true;
            return Number(value) >= Number(req.body.born);
        })
        .withMessage('Год смерти не может быть раньше года рождения')
];

const validateBook = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Введите название книги')
        .bail()
        .isLength({ max: 200 })
        .withMessage('Название книги не должно превышать 200 символов')
        .bail()
        .custom(async (value, { req }) => {
            if (!(await isUnique(Book, 'title', value, req))) {
                throw new Error('Книга с таким названием уже существует');
            }
            return true;
        }),

    body('authorId')
        .notEmpty()
        .withMessage('Выберите автора')
        .bail()
        .isInt({ min: 1 })
        .withMessage('Выберите корректного автора')
        .bail()
        .custom(async value => {
            if (!(await Author.findByPk(value))) {
                throw new Error('Выбранный автор не существует');
            }
            return true;
        }),

    body('genreId')
        .notEmpty()
        .withMessage('Выберите жанр')
        .bail()
        .isInt({ min: 1 })
        .withMessage('Выберите корректный жанр')
        .bail()
        .custom(async value => {
            if (!(await Genre.findByPk(value))) {
                throw new Error('Выбранный жанр не существует');
            }
            return true;
        }),

    body('pages')
        .notEmpty()
        .withMessage('Укажите количество страниц')
        .bail()
        .isInt({ min: 1 })
        .withMessage('Количество страниц должно быть положительным целым числом'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Введите описание книги')
        .bail()
        .isLength({ max: 5000 })
        .withMessage('Описание не должно превышать 5000 символов'),

    body('publicationDate')
        .notEmpty()
        .withMessage('Укажите дату публикации')
        .bail()
        .isISO8601()
        .withMessage('Укажите корректную дату публикации')
];

const validateGenre = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Название жанра должно содержать от 2 до 100 символов')
        .bail()
        .matches(/^[\p{L}\p{M}\s'’\-]+$/u)
        .withMessage(
            'Название жанра может содержать буквы, диакритические знаки, пробелы, дефисы и апострофы'
        )
        .bail()
        .custom(async (value, { req }) => {
            if (!(await isUnique(Genre, 'name', value, req))) {
                throw new Error('Жанр с таким названием уже существует');
            }
            return true;
        })
];

function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).render('error', {
            title: 'Ошибка валидации',
            message: errors.array().map(error => error.msg).join('. ')
        });
    }

    next();
}

module.exports = {
    validateRegistration,
    validateRegister: validateRegistration,
    validateLogin,
    validateAuthor,
    validateBook,
    validateGenre,
    handleValidationErrors
};