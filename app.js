require('dotenv').config();

const express = require('express');
const app = express();

const sequelize = require('./config/database');

const courseRoutes = require('./routes/courseRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const logger = require('./middleware/logger');

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(logger);

app.get('/', (req, res) => {
    res.redirect('/courses');
});

app.use('/courses', courseRoutes);
app.use('/teachers', teacherRoutes);
app.use('/statistics', statisticsRoutes);

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