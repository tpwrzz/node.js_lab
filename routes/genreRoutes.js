const express = require('express');
const router = express.Router();

const {
    getGenres,
    getGenreById,
    getCreateForm,
    addGenre,
    getEditForm,
    updateGenre,
    deleteGenre
} = require('../controllers/genreController');

const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { validateGenre } = require('../middleware/validateData');

router.get('/', getGenres);
router.get('/new', isAuthenticated, isAdmin, getCreateForm);
router.get('/:id/edit', isAuthenticated, isAdmin, getEditForm);
router.get('/:id', getGenreById);

router.post('/', isAuthenticated, isAdmin, validateGenre, addGenre);
router.post('/:id/edit', isAuthenticated, isAdmin, validateGenre, updateGenre);
router.post('/:id/delete', isAuthenticated, isAdmin, deleteGenre);

module.exports = router;