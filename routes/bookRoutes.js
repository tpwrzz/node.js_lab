const express = require('express');
const { isAdmin } = require('../middleware/auth');

const {
    getBooks,
    getCreateForm,
    addBook,
    getBookById,
    getEditForm,
    updateBook,
    deleteBook,
    borrowBook,
    returnBook
} = require('../controllers/bookController');

const { validateBook } = require('../middleware/validateData');

const router = express.Router();

router.get('/', getBooks);
router.get('/new', isAdmin, getCreateForm);
router.post('/', isAdmin, validateBook, addBook);
router.get('/:id', getBookById);
router.get('/:id/edit', isAdmin, getEditForm);
router.post('/:id/edit', isAdmin, validateBook, updateBook);
router.post('/:id/borrow', borrowBook);
router.post('/:id/return', returnBook);

router.post('/:id/delete', isAdmin, deleteBook);

module.exports = router;
