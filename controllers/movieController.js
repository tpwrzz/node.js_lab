
const { movies } = require('../models/movieModel');

// GET /api/movies — получить все фильмы или отфильтровать по жанру
const getmovies = (req, res) => {
    let result = [...movies];

    const genre = req.query.genre;

    if (genre) {
        result = result.filter(movie =>
            movie.genre.toLowerCase() === genre.toLowerCase()
        );
    }

    res.json(result);
};

// GET /api/movies/:id — получить фильм по ID
const getmovieById = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'Invalid movie ID'
        });
    }

    const movie = movies.find(movie => movie.id === id);

    if (!movie) {
        return res.status(404).json({
            error: 'Movie not found'
        });
    }

    res.json(movie);
};

// POST /api/movies — добавить фильм
const addmovie = (req, res) => {
    const { title, genre, year, director } = req.body;

    if (
        typeof title !== 'string' || !title.trim() ||
        typeof genre !== 'string' || !genre.trim() ||
        typeof director !== 'string' || !director.trim() ||
        year === undefined || year === '' ||
        !Number.isInteger(Number(year)) ||
        Number(year) < 1888 ||
        Number(year) > new Date().getFullYear()
    ) {
        return res.status(400).json({
            error: 'Invalid movie data'
        });
    }

    const newmovie = {
        id: movies.length
            ? Math.max(...movies.map(movie => movie.id)) + 1
            : 1,
        title: title.trim(),
        genre: genre.trim(),
        year: Number(year),
        director: director.trim()
    };

    movies.push(newmovie);

    res.redirect('/movies');
};

// PATCH /api/movies/:id — изменить фильм
const updatemovie = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'Invalid movie ID'
        });
    }

    const movie = movies.find(movie => movie.id === id);

    if (!movie) {
        return res.status(404).json({
            error: 'Movie not found'
        });
    }

    const { title, genre, year, director } = req.body;

    if (
        Object.keys(req.body).length === 0 ||
        (title !== undefined &&
            (typeof title !== 'string' || !title.trim())) ||
        (genre !== undefined &&
            (typeof genre !== 'string' || !genre.trim())) ||
        (director !== undefined &&
            (typeof director !== 'string' || !director.trim())) ||
        (year !== undefined &&
            (year === '' ||
                !Number.isInteger(Number(year)) ||
                Number(year) < 1888 ||
                Number(year) > new Date().getFullYear()))
    ) {
        return res.status(400).json({
            error: 'Invalid movie data'
        });
    }

    if (title !== undefined) movie.title = title.trim();
    if (genre !== undefined) movie.genre = genre.trim();
    if (director !== undefined) movie.director = director.trim();
    if (year !== undefined) movie.year = Number(year);

    res.json(movie);
};

// DELETE /api/movies/:id — удалить фильм
const deletemovie = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'Invalid movie ID'
        });
    }

    const index = movies.findIndex(movie => movie.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: 'Movie not found'
        });
    }

    movies.splice(index, 1);

    res.redirect(303, '/movies');
};

// GET /movies — отобразить список фильмов через EJS
const getMoviesPage = (req, res) => {
    let result = [...movies];

    const search = req.query.search || '';
    const year = req.query.year || '';

    if (search) {
        const searchLower = search.toLowerCase();

        result = result.filter(movie =>
            movie.title.toLowerCase().includes(searchLower) ||
            movie.director.toLowerCase().includes(searchLower) ||
            movie.genre.toLowerCase().includes(searchLower)
        );
    }

    if (year) {
        result = result.filter(
            movie => movie.year === Number(year)
        );
    }

    res.render('movies/index', {
        title: 'Каталог фильмов',
        movies: result,
        search,
        year
    });
};

// Страницы форм — если они нужны в твоём проекте
const getCreateForm = (req, res) => {
    res.render('movies/create', {
        title: 'Добавить фильм',
        errors: [],
        formData: {}
    });
};

const getEditForm = (req, res) => {
    const movie = movies.find(
        movie => movie.id === Number(req.params.id)
    );

    if (!movie) {
        return res.status(404).render('404', {
            url: req.originalUrl
        });
    }

    res.render('movies/edit', {
        title: 'Редактировать фильм',
        movie,
        errors: [],
        formData: {}
    });
};

module.exports = {
    getmovies,
    getmovieById,
    addmovie,
    updatemovie,
    deletemovie,
    getMoviesPage,
    getCreateForm,
    getEditForm
};
