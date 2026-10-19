const bcrypt = require('bcrypt');
const { User } = require('../models');

exports.showRegister = (req, res) => {
    res.render('auth/register', { errors: [], formData: {} });
};

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        const errors = [];

        if (!name || name.trim().length < 2) {
            errors.push({ msg: 'Имя должно содержать минимум 2 символа' });
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push({ msg: 'Введите корректный email' });
        }

        if (!password || password.length < 6) {
            errors.push({ msg: 'Пароль должен содержать минимум 6 символов' });
        }

        if (password !== confirmPassword) {
            errors.push({ msg: 'Пароли не совпадают' });
        }

        if (errors.length > 0) {
            return res.status(400).render('auth/register', {
                errors,
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

        if (!email || !password) {
            return res.status(400).render('auth/login', {
                errors: [{ msg: 'Введите email и пароль' }],
                email: email || ''
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

        res.render('profile', { user });
    } catch (error) {
        next(error);
    }
};
