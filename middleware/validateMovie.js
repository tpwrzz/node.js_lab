const validatemovie = (req, res, next) => {
    const { title, genre, year, director } = req.body;

    const errors = [];

    if (!title || !title.trim()) {
        errors.push('Название фильма обязательно');
    }

    if (year === undefined || year === '') {
        errors.push('Год выпуска обязателен');
    } else if (isNaN(Number(year)) || Number(year) <= 1888 ) {
        errors.push('Год выпуска должен равнять или быть больше 1888');
    }

    if (director === undefined || director === '') {
        errors.push('Режиссер обязателен');
    } else if (!director.trim()) {
        errors.push('Режиссер не может быть пустым');
    }
     if (genre === undefined || genre === '') {
        errors.push('Жанр обязателен');
    } else if (!genre.trim()) {
        errors.push('Жанр не может быть пустым');
    }

    
    if (errors.length > 0) {
        const view = req.params.id
            ? 'movies/edit'
            : 'movies/create';

        const movieData = {
            id: req.params.id ? Number(req.params.id) : undefined,
            title,
            genre,
            year,
            director
        };

        return res.status(400).render(view, {
            title: req.params.id
                ? 'Редактировать фильм'
                : 'Добавить фильм',
            movie: movieData,
            formData: movieData,
            errors
        });
    }

    next();
};

module.exports = validatemovie;