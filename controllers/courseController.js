const { Op } = require('sequelize');
const { Course, Teacher } = require('../models');
const { logAdminAction } = require('../middleware/logger');
const { validationResult } = require('express-validator');

const getCourses = async (req, res, next) => {
    try {
        const search = req.query.search || '';
        const teacherId = req.query.teacherId || '';
        const semester = req.query.semester || '';

        const where = {};

        // Поиск по названию курса
        if (search) {
            where.title = {
                [Op.iLike]: `%${search}%`
            };
        }

        // Фильтрация по преподавателю
        if (teacherId) {
            const teacherIdNumber = Number(teacherId);

            if (!Number.isInteger(teacherIdNumber) || teacherIdNumber <= 0) {
                return res.status(400).render('error', {
                    title: 'Ошибка',
                    message: 'Некорректный ID преподавателя'
                });
            }

            where.teacherId = teacherIdNumber;
        }

        // Фильтрация по семестру
        if (semester) {
            const semesterNumber = Number(semester);

            if (!Number.isInteger(semesterNumber) || semesterNumber < 1 || semesterNumber > 12) {
                return res.status(400).render('error', {
                    title: 'Ошибка',
                    message: 'Некорректный семестр'
                });
            }

            where.semester = semesterNumber;
        }

        const [courses, teachers] = await Promise.all([
            Course.findAll({
                where,
                include: {
                    model: Teacher,
                    attributes: ['id', 'name', 'email', 'department']
                },
                order: [['id', 'ASC']]
            }),

            Teacher.findAll({
                order: [['name', 'ASC']]
            })
        ]);

        res.render('courses/index', {
            title: 'Courses',
            courses,
            teachers,
            search,
            teacherId,
            semester
        });
    } catch (error) {
        next(error);
    }
};


const getCourseById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const course = await Course.findByPk(id, {
            include: {
                model: Teacher,
                attributes: ['id', 'name', 'email', 'department']
            }
        });

        if (!course) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        res.render('courses/details', {
            title: course.title,
            course
        });
    } catch (error) {
        next(error);
    }
};


const getCreateForm = async (req, res, next) => {
    try {
        const teachers = await Teacher.findAll({
            order: [['name', 'ASC']]
        });

        res.render('courses/create', {
            title: 'Добавить курс',
            teachers,
            errors: [],
            formData: {}
        });
    } catch (error) {
        next(error);
    }
};




const addCourse = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        const {
            title,
            teacherId,
            credits,
            semester,
            description
        } = req.body;

        const teachers = await Teacher.findAll({
            order: [['name', 'ASC']]
        });

        if (!errors.isEmpty()) {
            return res.status(400).render('courses/create', {
                title: 'Добавить курс',
                errors: errors.array(),
                teachers,
                formData: req.body
            });
        }

        const teacherIdNumber = Number(teacherId);
        const teacher = await Teacher.findByPk(teacherIdNumber);

        if (!teacher) {
            return res.status(400).render('courses/create', {
                title: 'Добавить курс',
                errors: [{ msg: 'Выбранный преподаватель не существует' }],
                teachers,
                formData: req.body
            });
        }

        const course = await Course.create({
            title: title.trim(),
            teacherId: teacherIdNumber,
            credits: Number(credits),
            semester: Number(semester),
            description: description.trim()
        });

        logAdminAction(req, 'CREATE', 'COURSE', course.id);

        const io = req.app.get('io');

        if (io) {
            io.emit('courseCreated', {
                title: course.title,
                teacherName: teacher.name,
                createdAt: new Date().toLocaleString('ru-RU', {
                    timeZone: 'Europe/Chisinau'
                })
            });
        }

        return res.redirect('/courses');
    } catch (error) {
        next(error);
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

        const [course, teachers] = await Promise.all([
            Course.findByPk(id, {
                include: Teacher
            }),

            Teacher.findAll({
                order: [['name', 'ASC']]
            })
        ]);

        if (!course) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        res.render('courses/edit', {
            title: 'Редактировать курс',
            course,
            teachers,
            errors: []
        });
    } catch (error) {
        next(error);
    }
};



const updateCourse = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const course = await Course.findByPk(id);

        if (!course) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const teachers = await Teacher.findAll({
            order: [['name', 'ASC']]
        });

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).render('courses/edit', {
                title: 'Редактировать курс',
                course: {
                    ...course.toJSON(),
                    ...req.body
                },
                teachers,
                errors: errors.array()
            });
        }

        const {
            title,
            teacherId,
            credits,
            semester,
            description
        } = req.body;

        const teacherIdNumber = Number(teacherId);
        const teacher = await Teacher.findByPk(teacherIdNumber);

        if (!teacher) {
            return res.status(400).render('courses/edit', {
                title: 'Редактировать курс',
                course: {
                    ...course.toJSON(),
                    ...req.body
                },
                teachers,
                errors: [{ msg: 'Выбранный преподаватель не существует' }]
            });
        }

        await course.update({
            title: title.trim(),
            teacherId: teacherIdNumber,
            credits: Number(credits),
            semester: Number(semester),
            description: description.trim()
        });

        logAdminAction(req, 'UPDATE', 'COURSE', course.id);

        return res.redirect(`/courses/${course.id}`);
    } catch (error) {
        next(error);
    }
};



const deleteCourse = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        const course = await Course.findByPk(id);

        if (!course) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        await course.destroy();
        logAdminAction(req, 'DELETE', 'COURSE', course.id);
        res.redirect('/courses');
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getCourses,
    getCreateForm,
    getCourseById,
    getEditForm,
    addCourse,
    updateCourse,
    deleteCourse
};