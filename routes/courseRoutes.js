const express = require('express');

const {
    getCourses,
    getCreateForm,
    getCourseById,
    getEditForm,
    addCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');

const validateCourse = require('../middleware/validateData');

const router = express.Router();

router.get('/', getCourses);

router.get('/new', getCreateForm);
router.post('/', validateCourse, addCourse);

router.get('/:id/edit', getEditForm);
router.post('/:id/edit', validateCourse, updateCourse);

router.get('/:id', getCourseById);
router.post('/:id/delete', deleteCourse);

module.exports = router;