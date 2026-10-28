const { body, validationResult } = require('express-validator');

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
        .withMessage('Имя автора должно содержать от 2 до 100 символов'),

    body('born')
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage('Укажите корректную дату рождения'),

    body('deceased')
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage('Укажите корректную дату смерти')
        .custom((value, { req }) => {
            if (!value || !req.body.born) return true;
            return new Date(value) >= new Date(req.body.born);
        })
        .withMessage('Дата смерти не может быть раньше даты рождения')
];

const validateBook = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Введите название книги')
        .bail()
        .isLength({ max: 200 })
        .withMessage('Название книги не должно превышать 200 символов'),

    body('authorId')
        .notEmpty()
        .withMessage('Выберите автора')
        .bail()
        .isInt({ min: 1 })
        .withMessage('Выберите корректного автора'),

    body('genreId')
        .notEmpty()
        .withMessage('Выберите жанр')
        .bail()
        .isInt({ min: 1 })
        .withMessage('Выберите корректный жанр'),

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
        .notEmpty()
        .withMessage('Введите название жанра')
        .bail()
        .isLength({ max: 100 })
        .withMessage('Название жанра не должно превышать 100 символов')
];

function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).render('error', {
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
