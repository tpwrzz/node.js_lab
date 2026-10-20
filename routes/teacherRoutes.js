const express = require('express');
const { isAdmin } = require('../middleware/auth');

const {
    getTeachers,
    getCreateForm,
    addTeacher,
    getTeacherById,
    getEditForm,
    updateTeacher,
    deleteTeacher
} = require('../controllers/teacherController');

const { validateTeacher } = require('../middleware/validateData');

const router = express.Router();

router.get('/', getTeachers);
router.get('/new', isAdmin, getCreateForm);
router.get('/:id', getTeacherById);

router.post('/', isAdmin, validateTeacher, addTeacher);
router.get('/:id/edit', isAdmin, getEditForm);
router.post('/:id/edit', isAdmin, validateTeacher, updateTeacher);
router.post('/:id/delete', isAdmin, deleteTeacher);

module.exports = router;