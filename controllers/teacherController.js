const { Teacher, Course } = require('../models');

const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.findAll({
            include: {
                model: Course,
                attributes: ['id']
            },
            order: [['name', 'ASC']]
        });

        res.render('teachers/index', {
            title: 'Преподаватели',
            teachers
        });
    } catch (error) {
        console.error('Error getting teachers:', error);

        res.status(500).render('error', {
            title: 'Ошибка',
            message: 'Не удалось загрузить преподавателей'
        });
    }
};


const getCreateForm = (req, res) => {
    res.render('teachers/create', {
        title: 'Добавить преподавателя',
        errors: [],
        formData: {}
    });
};


const addTeacher = async (req, res) => {
    try {
        const {
            name,
            email,
            department,
            academicDegree
        } = req.body;

        await Teacher.create({
            name: name.trim(),
            email: email.trim(),
            department: department.trim(),
            academicDegree: academicDegree.trim()
        });

        res.redirect('/teachers');
    } catch (error) {
        console.error('Error adding teacher:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).render('teachers/create', {
                title: 'Добавить преподавателя',
                errors: ['Преподаватель с таким email уже существует'],
                formData: req.body
            });
        }

        res.status(500).render('error', {
            title: 'Ошибка',
            message: 'Не удалось добавить преподавателя'
        });
    }
};


const getTeacherById = async (req, res) => {
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
                ],
                order: [['id', 'ASC']]
            }
        });

        if (!teacher) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        res.render('teachers/details', {
            title: teacher.name,
            teacher
        });
    } catch (error) {
        console.error('Error getting teacher:', error);

        res.status(500).render('error', {
            title: 'Ошибка',
            message: 'Не удалось загрузить преподавателя'
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

        const teacher = await Teacher.findByPk(id);

        if (!teacher) {
            return res.status(404).render('404', {
                url: req.originalUrl
            });
        }

        res.render('teachers/edit', {
            title: 'Редактировать преподавателя',
            teacher,
            errors: []
        });
    } catch (error) {
        console.error('Error loading teacher edit form:', error);

        res.status(500).render('error', {
            title: 'Ошибка',
            message: 'Не удалось загрузить форму редактирования'
        });
    }
};


const updateTeacher = async (req, res) => {
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

        const {
            name,
            email,
            department,
            academicDegree
        } = req.body;

        const existingTeacher = await Teacher.findOne({
            where: {
                email: email.trim()
            }
        });

        if (
            existingTeacher &&
            existingTeacher.id !== teacher.id
        ) {
            return res.status(400).render('teachers/edit', {
                title: 'Редактировать преподавателя',
                teacher: {
                    ...teacher.toJSON(),
                    ...req.body
                },
                errors: [
                    'Преподаватель с таким email уже существует'
                ]
            });
        }

        await teacher.update({
            name: name.trim(),
            email: email.trim(),
            department: department.trim(),
            academicDegree: academicDegree.trim()
        });

        res.redirect(`/teachers/${teacher.id}`);
    } catch (error) {
        console.error('Error updating teacher:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).render('teachers/edit', {
                title: 'Редактировать преподавателя',
                teacher: {
                    ...req.body,
                    id: req.params.id
                },
                errors: [
                    'Преподаватель с таким email уже существует'
                ]
            });
        }

        res.status(500).render('error', {
            title: 'Ошибка',
            message: 'Не удалось обновить преподавателя'
        });
    }
};


const deleteTeacher = async (req, res) => {
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
            return res.status(400).render('error', {
                title: 'Невозможно удалить преподавателя',
                message: 'Невозможно удалить преподавателя, у которого есть курсы'
            });
        }

        await teacher.destroy();

        res.redirect('/teachers');
    } catch (error) {
        console.error('Error deleting teacher:', error);

        res.status(500).render('error', {
            title: 'Ошибка',
            message: 'Не удалось удалить преподавателя'
        });
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