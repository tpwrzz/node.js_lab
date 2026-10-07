const { Op } = require('sequelize');
const { Course, Teacher } = require('../models');

const getCourses = async (req, res) => {
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

            if (!Number.isInteger(teacherIdNumber)) {
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

            if (!Number.isInteger(semesterNumber)) {
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
        console.error('Error getting courses:', error);

        res.status(500).render('error', {
            title: 'Ошибка',
            message: 'Не удалось загрузить курсы'
        });
    }
};


const getCourseById = async (req, res) => {
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
        console.error('Error getting course:', error);

        res.status(500).render('error', {
            title: 'Ошибка',
            message: 'Не удалось загрузить курс'
        });
    }
};


const getCreateForm = async (req, res) => {
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
        console.error('Error loading create course form:', error);

        res.status(500).render('error', {
            title: 'Ошибка',
            message: 'Не удалось загрузить форму добавления курса'
        });
    }
};


const addCourse = async (req, res) => {
    try {
        const {
            title,
            teacherId,
            credits,
            semester,
            description
        } = req.body;

        const teacherIdNumber = Number(teacherId);

        // Проверяем существование преподавателя
        const teacher = await Teacher.findByPk(teacherIdNumber);

        if (!teacher) {
            return res.status(400).render('error', {
                title: 'Ошибка',
                message: 'Выбранный преподаватель не существует'
            });
        }

        await Course.create({
            title: title.trim(),
            teacherId: teacherIdNumber,
            credits: Number(credits),
            semester: Number(semester),
            description: description.trim()
        });

        res.redirect('/courses');
    } catch (error) {
        console.error('Error adding course:', error);

        res.status(500).render('error', {
            title: 'Ошибка',
            message: 'Не удалось добавить курс'
        });
    }
};


const getEditForm = async (req, res) => {
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
        console.error('Error loading edit course form:', error);

        res.status(500).render('error', {
            title: 'Ошибка',
            message: 'Не удалось загрузить форму редактирования курса'
        });
    }
};


const updateCourse = async (req, res) => {
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

        const {
            title,
            teacherId,
            credits,
            semester,
            description
        } = req.body;

        const teacherIdNumber = Number(teacherId);

        // Проверяем существование преподавателя
        const teacher = await Teacher.findByPk(teacherIdNumber);

        if (!teacher) {
            return res.status(400).render('error', {
                title: 'Ошибка',
                message: 'Выбранный преподаватель не существует'
            });
        }

        await course.update({
            title: title.trim(),
            teacherId: teacherIdNumber,
            credits: Number(credits),
            semester: Number(semester),
            description: description.trim()
        });

        res.redirect(`/courses/${course.id}`);
    } catch (error) {
        console.error('Error updating course:', error);

        res.status(500).render('error', {
            title: 'Ошибка',
            message: 'Не удалось обновить курс'
        });
    }
};


const deleteCourse = async (req, res) => {
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

        res.redirect('/courses');
    } catch (error) {
        console.error('Error deleting course:', error);

        res.status(500).render('error', {
            title: 'Ошибка',
            message: 'Не удалось удалить курс'
        });
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