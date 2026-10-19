require('dotenv').config();

const express = require('express');
const app = express();

const sequelize = require('./config/database');
const session = require('express-session');
require('dotenv').config();

const courseRoutes = require('./routes/courseRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const authRoutes = require('./routes/authRoutes');
const logger = require('./middleware/logger');
const { isAuthenticated, isAdmin } = require('./middleware/auth');

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(logger);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60,
        httpOnly: true
    }
}));

app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});


// app.get('/', (req, res) => {
//     res.redirect('/courses');
// });

app.use('/courses', courseRoutes);
app.use('/teachers', teacherRoutes);
app.use('/statistics', statisticsRoutes);
app.use('/', authRoutes);

// Global 404 handler
app.use((req, res) => {
    res.status(404).render('404', {
        url: req.originalUrl
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).render('error', {
        message: 'Произошла внутренняя ошибка сервера'
    });
});

async function startServer() {
    try {
        await sequelize.authenticate();

        console.log('Database connection established');

        await sequelize.sync();

        console.log('Database tables synchronized');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start application:', error.message);
    }
}

startServer();