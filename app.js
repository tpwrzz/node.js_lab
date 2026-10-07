'use strict';

const express = require('express');
const app = express();

const courseRoutes = require('./routes/courseRoutes');
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

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});