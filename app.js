require('dotenv').config();

const morgan = require('morgan');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('./config/database');
const session = require('express-session');

const app = express();

const server = http.createServer(app);
const io = new Server(server);
app.set('io', io);

const courseRoutes = require('./routes/courseRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const authRoutes = require('./routes/authRoutes');
const logger = require('./middleware/logger');
const { isAuthenticated, isAdmin } = require('./middleware/auth');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(morgan('dev')); 
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

app.use('/courses', courseRoutes);
app.use('/teachers', teacherRoutes);
app.use('/statistics', isAuthenticated, statisticsRoutes);
app.use('/', authRoutes);

app.use(notFound);
app.use(errorHandler);


async function startServer() {
    try {
        await sequelize.authenticate();

        console.log('Database connection established');

        await sequelize.sync();

        console.log('Database tables synchronized');

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start application:', error.message);
    }
}

startServer();