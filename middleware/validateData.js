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

const validateTeacher = [
    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Имя должно содержать минимум 2 символа'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Введите корректный email'),

    body('department')
        .trim()
        .notEmpty()
        .withMessage('Укажите кафедру'),

    body('academicDegree')
        .trim()
        .notEmpty()
        .withMessage('Укажите учёную степень')
];


const validateCourse = [
    body('title')
        .trim()
        .notEmpty().withMessage('Введите название курса')
        .bail()
        .isLength({ max: 200 }).withMessage('Название курса не должно превышать 200 символов'),

    body('credits')
        .notEmpty().withMessage('Укажите количество кредитов')
        .bail()
        .isInt({ min: 1, max: 60 })
        .withMessage('Количество кредитов должно быть целым числом от 1 до 60'),

    body('semester')
        .notEmpty().withMessage('Укажите семестр')
        .bail()
        .isInt({ min: 1, max: 12 })
        .withMessage('Семестр должен быть целым числом от 1 до 12'),

    body('description')
        .trim()
        .notEmpty().withMessage('Введите описание курса')
        .bail()
        .isLength({ max: 5000 })
        .withMessage('Описание не должно превышать 5000 символов'),

    body('teacherId')
        .notEmpty().withMessage('Выберите преподавателя')
        .bail()
        .isInt({ min: 1 })
        .withMessage('Выберите корректного преподавателя')
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
    validateLogin,
    validateTeacher,
    validateCourse,
    handleValidationErrors
};
