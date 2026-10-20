
const { Teacher, Course } = require('../models');
const { validationResult } = require('express-validator');
const { logAdminAction } = require('../middleware/logger');

const getTeachers = async (req, res, next) => {
    try {
        const teachers = await Teacher.findAll({
            include: {
                model: Course,
                attributes: ['id']
            },
            order: [['name', 'ASC']]
        });

        return res.render('teachers/index', {
            title: 'Преподаватели',
            teachers
        });
    } catch (error) {
        return next(error);
    }
};

const getCreateForm = (req, res) => {
    return res.render('teachers/create', {
        title: 'Добавить преподавателя',
        errors: [],
        formData: {}
    });
};

const addTeacher = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).render('teachers/create', {
                title: 'Добавить преподавателя',
                errors: errors.array(),
                formData: req.body
            });
        }

        const { name, email, department, academicDegree } = req.body;
        const normalizedEmail = email.trim().toLowerCase();

        const existingTeacher = await Teacher.findOne({
            where: { email: normalizedEmail }
        });

        if (existingTeacher) {
            return res.status(409).render('teachers/create', {
                title: 'Добавить преподавателя',
                errors: [
                    { msg: 'Преподаватель с таким email уже существует' }
                ],
                formData: req.body
            });
        }

        const teacher = await Teacher.create({
            name: name.trim(),
            email: normalizedEmail,
            department: department.trim(),
            academicDegree: academicDegree.trim()
        });

        logAdminAction(req, 'CREATE', 'TEACHER', teacher.id);

        return res.redirect('/teachers');
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).render('teachers/create', {
                title: 'Добавить преподавателя',
                errors: [
                    { msg: 'Преподаватель с таким email уже существует' }
                ],
                formData: req.body
            });
        }

        return next(error);
    }
};

const getTeacherById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const teacher = await Teacher.findByPk(id, {
            include: {
                model: Course,
                attributes: [
                    'id',
                    'title',
                    'credits',
                    'semester',
                    'description'
                ]
            }
        });

        if (!teacher) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        return res.render('teachers/details', {
            title: teacher.name,
            teacher
        });
    } catch (error) {
        return next(error);
    }
};

const getEditForm = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const teacher = await Teacher.findByPk(id);

        if (!teacher) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        return res.render('teachers/edit', {
            title: 'Редактировать преподавателя',
            teacher,
            errors: []
        });
    } catch (error) {
        return next(error);
    }
};

const updateTeacher = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const teacher = await Teacher.findByPk(id);

        if (!teacher) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).render('teachers/edit', {
                title: 'Редактировать преподавателя',
                teacher: {
                    ...teacher.toJSON(),
                    ...req.body
                },
                errors: errors.array()
            });
        }

        const { name, email, department, academicDegree } = req.body;
        const normalizedEmail = email.trim().toLowerCase();

        const existingTeacher = await Teacher.findOne({
            where: { email: normalizedEmail }
        });

        if (existingTeacher && existingTeacher.id !== teacher.id) {
            return res.status(409).render('teachers/edit', {
                title: 'Редактировать преподавателя',
                teacher: {
                    ...teacher.toJSON(),
                    ...req.body
                },
                errors: [
                    { msg: 'Преподаватель с таким email уже существует' }
                ]
            });
        }

        await teacher.update({
            name: name.trim(),
            email: normalizedEmail,
            department: department.trim(),
            academicDegree: academicDegree.trim()
        });

        logAdminAction(req, 'UPDATE', 'TEACHER', teacher.id);

        return res.redirect(`/teachers/${teacher.id}`);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).render('teachers/edit', {
                title: 'Редактировать преподавателя',
                teacher: {
                    ...(req.body || {}),
                    id: req.params.id
                },
                errors: [
                    { msg: 'Преподаватель с таким email уже существует' }
                ]
            });
        }

        return next(error);
    }
};

const deleteTeacher = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const teacher = await Teacher.findByPk(id, {
            include: {
                model: Course,
                attributes: ['id']
            }
        });

        if (!teacher) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        if (teacher.Courses.length > 0) {
            return res.status(409).render('error', {
                title: 'Невозможно удалить преподавателя',
                message: 'Невозможно удалить преподавателя, у которого есть курсы'
            });
        }

        await teacher.destroy();

        logAdminAction(req, 'DELETE', 'TEACHER', teacher.id);

        return res.redirect('/teachers');
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getTeachers,
    getCreateForm,
    addTeacher,
    getTeacherById,
    getEditForm,
    updateTeacher,
    deleteTeacher
};
