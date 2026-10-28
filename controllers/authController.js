const bcrypt = require('bcrypt');
const { User, TakenBooks, Book } = require('../models');
const { validationResult } = require('express-validator');

exports.showRegister = (req, res) => {
    res.render('auth/register', { errors: [], formData: {} });
};

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).render('auth/register', {
                title: 'Регистрация',
                errors: errors.array(),
                formData: { name, email }
            });
        }

        const existingUser = await User.findOne({
            where: { email: email.trim().toLowerCase() }
        });

        if (existingUser) {
            return res.status(409).render('auth/register', {
                errors: [{ msg: 'Этот email уже зарегистрирован' }],
                formData: { name, email }
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            Number(process.env.BCRYPT_ROUNDS) || 10
        );

        await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: 'user'
        });

        return res.redirect('/login');
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).render('auth/register', {
                errors: [{ msg: 'Этот email уже зарегистрирован' }],
                formData: {
                    name: req.body.name,
                    email: req.body.email
                }
            });
        }

        next(error);
    }
};

exports.showLogin = (req, res) => {
    res.render('auth/login', { errors: [], email: '' });
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).render('auth/login', {
                title: 'Вход',
                errors: errors.array(),
                email
            });
        }

        const user = await User.findOne({
            where: { email: email.trim().toLowerCase() }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).render('auth/login', {
                errors: [{ msg: 'Неверный email или пароль' }],
                email
            });
        }

        await user.update({ lastLogin: new Date() });

        req.session.regenerate((err) => {
            if (err) {
                return next(err);
            }

            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            req.session.save((saveError) => {
                if (saveError) {
                    return next(saveError);
                }

                return res.redirect('/profile');
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }

        res.clearCookie('connect.sid');
        return res.redirect('/login');
    });
};

exports.profile = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.session.user.id);

        if (!user) {
            req.session.destroy(() => {
                res.redirect('/login');
            });
            return;
        }

        const takenBooks = await TakenBooks.findAll({
            where: { userId: user.id },
            attributes: ['bookId'],
            raw: true
        });

        const books = await Book.findAll({
            where: {
                id: takenBooks.map(book => book.bookId)
            },
            attributes: ['id', 'title', 'isTaken'],
            raw: true
        });
        console.log('Books:', books); // Debugging line to check the books array
        res.render('profile', {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin
            },
            books: books
        });
    } catch (error) {
        next(error);
    }
};
