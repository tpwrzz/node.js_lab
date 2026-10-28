const express = require('express');
const { isAdmin } = require('../middleware/auth');

const {
    getAuthors,
    getCreateForm,
    addAuthor,
    getAuthorById,
    getEditForm,
    updateAuthor,
    deleteAuthor
} = require('../controllers/authorController');

const { validateAuthor } = require('../middleware/validateData');

const router = express.Router();

router.get('/', getAuthors);
router.get('/new', isAdmin, getCreateForm);
router.get('/:id', getAuthorById);
router.get('/:id/edit', isAdmin, getEditForm);

router.post('/', isAdmin, validateAuthor, addAuthor);
router.post('/:id/edit', isAdmin, validateAuthor, updateAuthor);
router.post('/:id/delete', isAdmin, deleteAuthor);

module.exports = router;
