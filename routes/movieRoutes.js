
const express = require('express');
const router = express.Router();

const {
    getmovies,
    getmovieById,
    addmovie,
    updatemovie,
    deletemovie,
    getMoviesPage,
    getCreateForm,
    getEditForm
} = require('../controllers/movieController');

// HTML-страницы
router.get('/', getMoviesPage);
router.get('/new', getCreateForm);
router.get('/:id/edit', getEditForm);

router.get('/', getmovies);
router.get('/:id', getmovieById);
router.post('/', addmovie);
router.patch('/:id', updatemovie);
router.delete('/:id', deletemovie);

module.exports = router;
