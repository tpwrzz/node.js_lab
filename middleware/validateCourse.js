const validateCourse = (req, res, next) => {
    const { title, teacher, credits, semester, description } = req.body;

    const errors = [];

    if (!title || !title.trim()) {
        errors.push('Название дисциплины обязательно');
    }

    if (!teacher || !teacher.trim()) {
        errors.push('Преподаватель обязателен');
    }

    if (credits === undefined || credits === '') {
        errors.push('Количество кредитов обязательно');
    } else if (isNaN(Number(credits)) || Number(credits) <= 0) {
        errors.push('Количество кредитов должно быть положительным числом');
    }

    if (semester === undefined || semester === '') {
        errors.push('Семестр обязателен');
    } else if (
        !Number.isInteger(Number(semester)) ||
        Number(semester) < 1 ||
        Number(semester) > 8
    ) {
        errors.push('Семестр должен находиться в диапазоне от 1 до 8');
    }

    if (!description || !description.trim()) {
        errors.push('Описание дисциплины обязательно');
    }

    if (errors.length > 0) {
        const view = req.params.id
            ? 'courses/edit'
            : 'courses/create';

        const courseData = {
            id: req.params.id ? Number(req.params.id) : undefined,
            title,
            teacher,
            credits,
            semester,
            description
        };

        return res.status(400).render(view, {
            title: req.params.id
                ? 'Редактировать курс'
                : 'Добавить курс',
            course: courseData,
            formData: courseData,
            errors
        });
    }

    next();
};

module.exports = validateCourse;