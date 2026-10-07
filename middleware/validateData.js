const { Teacher } = require('../models');

const validateData = async (req, res, next) => {
    const isTeacher = req.baseUrl === '/teachers';

    const errors = [];

    if (isTeacher) {
        const {
            name,
            email,
            department,
            academicDegree
        } = req.body;

        // Валидация преподавателя

        if (!name || !name.trim()) {
            errors.push('Имя преподавателя обязательно');
        }

        if (!email || !email.trim()) {
            errors.push('Email обязателен');
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email.trim())) {
                errors.push('Введите корректный email');
            }
        }

        if (!department || !department.trim()) {
            errors.push('Кафедра обязательна');
        }

        if (!academicDegree || !academicDegree.trim()) {
            errors.push('Учёная степень обязательна');
        }

        if (errors.length > 0) {
            const teacherData = {
                id: req.params.id
                    ? Number(req.params.id)
                    : undefined,
                name,
                email,
                department,
                academicDegree
            };

            const view = req.params.id
                ? 'teachers/edit'
                : 'teachers/create';

            return res.status(400).render(view, {
                title: req.params.id
                    ? 'Редактировать преподавателя'
                    : 'Добавить преподавателя',
                teacher: teacherData,
                formData: teacherData,
                errors
            });
        }

        return next();
    }

    // Валидация курса

    const {
        title,
        teacherId,
        credits,
        semester,
        description
    } = req.body;

    if (!title || !title.trim()) {
        errors.push('Название дисциплины обязательно');
    }

    // Проверка преподавателя
    if (!teacherId || teacherId === '') {
        errors.push('Преподаватель обязателен');
    } else if (
        !Number.isInteger(Number(teacherId)) ||
        Number(teacherId) <= 0
    ) {
        errors.push('Некорректный преподаватель');
    } else {
        try {
            const teacher = await Teacher.findByPk(Number(teacherId));

            if (!teacher) {
                errors.push('Выбранный преподаватель не существует');
            }
        } catch (error) {
            console.error('Error validating teacher:', error);

            return res.status(500).render('error', {
                title: 'Ошибка',
                message: 'Не удалось проверить преподавателя'
            });
        }
    }

    // Проверка количества кредитов
    if (credits === undefined || credits === '') {
        errors.push('Количество кредитов обязательно');
    } else if (
        !Number.isInteger(Number(credits)) ||
        Number(credits) <= 0
    ) {
        errors.push('Количество кредитов должно быть положительным целым числом');
    }

    // Проверка семестра
    if (semester === undefined || semester === '') {
        errors.push('Семестр обязателен');
    } else if (
        !Number.isInteger(Number(semester)) ||
        Number(semester) < 1 ||
        Number(semester) > 8
    ) {
        errors.push('Семестр должен находиться в диапазоне от 1 до 8');
    }

    // Проверка описания
    if (!description || !description.trim()) {
        errors.push('Описание дисциплины обязательно');
    }

    // Если есть ошибки
    if (errors.length > 0) {
        try {
            const teachers = await Teacher.findAll({
                order: [['name', 'ASC']]
            });

            const courseData = {
                id: req.params.id
                    ? Number(req.params.id)
                    : undefined,
                title,
                teacherId,
                credits,
                semester,
                description
            };

            const view = req.params.id
                ? 'courses/edit'
                : 'courses/create';

            return res.status(400).render(view, {
                title: req.params.id
                    ? 'Редактировать курс'
                    : 'Добавить курс',
                course: courseData,
                formData: courseData,
                teachers,
                errors
            });
        } catch (error) {
            console.error('Error loading teachers:', error);

            return res.status(500).render('error', {
                title: 'Ошибка',
                message: 'Не удалось загрузить список преподавателей'
            });
        }
    }

    next();
};

module.exports = validateData;