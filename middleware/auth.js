function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }

    return res.redirect('/login');
}

function isAdmin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }

    if (req.session.user.role !== 'admin') {
        return res.status(403).render('403');
    }

    return next();
}

module.exports = {
    isAuthenticated,
    isAdmin
};
