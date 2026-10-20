
const express = require('express');
const { isAdmin } = require('../middleware/auth');

const {
    getCourses,
    getCreateForm,
    getCourseById,
    getEditForm,
    addCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');

const { validateCourse } = require('../middleware/validateData');

const router = express.Router();

router.get('/', getCourses);

router.get('/new', isAdmin, getCreateForm);

router.get('/:id/edit', isAdmin, getEditForm);
router.post('/:id/edit', isAdmin, validateCourse, updateCourse);
router.post('/:id/delete', isAdmin, deleteCourse);

router.post('/', isAdmin, validateCourse, addCourse);

router.get('/:id', getCourseById);

module.exports = router;
