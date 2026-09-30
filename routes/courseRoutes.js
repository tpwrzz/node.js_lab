const express = require('express');

const {
    getCourses,
    getCourseById,
    addCourse,
    updateCourse,
    deleteCourse,
    searchCourses
} = require('../controllers/CourseController');

const router = express.Router();

router.get('/search', searchCourses);

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', addCourse);
router.patch('/:id', updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;