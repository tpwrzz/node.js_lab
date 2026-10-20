function errorHandler(err, req, res, next) {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    const status = Number(err.status || err.statusCode) || 500;
    const allowedStatuses = [400, 401, 403, 404, 409, 500];
    const code = allowedStatuses.includes(status) ? status : 500;

    if (code === 403) {
        return res.status(403).render('403');
    }

    if (code === 404) {
        return res.status(404).render('404', {
            url: req.originalUrl
        });
    }

    if (code === 409) {
        return res.status(409).render('error', {
            message: 'Такая запись уже существует'
        });
    }

    if (code === 400) {
        return res.status(400).render('error', {
            message: 'Переданы некорректные данные'
        });
    }

    if (code === 401) {
        return res.status(401).render('error', {
            message: 'Необходимо войти в систему'
        });
    }

    return res.status(500).render('error', {
        message: 'Произошла внутренняя ошибка сервера'
    });
}

module.exports = errorHandler;
