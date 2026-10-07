const express = require('express');

const {
    getTeachers,
    getCreateForm,
    addTeacher,
    getTeacherById,
    getEditForm,
    updateTeacher,
    deleteTeacher
} = require('../controllers/teacherController');

const validateData = require('../middleware/validateData');

const router = express.Router();

router.get('/', getTeachers);

router.get('/new', getCreateForm);
router.post('/', validateData, addTeacher);

router.get('/:id/edit', getEditForm);
router.post('/:id/edit', validateData, updateTeacher);

router.get('/:id', getTeacherById);
router.post('/:id/delete', deleteTeacher);

module.exports = router;