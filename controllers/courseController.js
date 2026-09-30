const { courses } = require('../models/courseModel');

const getCourses = (req, res) => {
    let result = courses;

    const search = req.query.search || '';
    const semester = req.query.semester || '';

    if (search) {
        const searchLower = search.toLowerCase();

        result = result.filter(course =>
            course.title.toLowerCase().includes(searchLower) ||
            course.teacher.toLowerCase().includes(searchLower)
        );
    }

    if (semester) {
        result = result.filter(
            course => course.semester === Number(semester)
        );
    }

    res.render('courses/index', {
        title: 'Courses',
        courses: result,
        search,
        semester
    });
};

const getCourseById = (req, res) => {
    const course = courses.find(
        course => course.id === Number(req.params.id)
    );

    if (!course) {
        return res.status(404).render('404', {
            url: req.originalUrl
        });
    }

    res.render('courses/details', {
        title: course.title,
        course
    });
};

const addCourse = (req, res) => {
    const { title, teacher, credits, semester, description } = req.body;

    const newCourse = {
        id: courses.length > 0
            ? Math.max(...courses.map(course => course.id)) + 1
            : 1,
        title: title.trim(),
        teacher: teacher.trim(),
        credits: Number(credits),
        semester: Number(semester),
        description: description.trim()
    };

    courses.push(newCourse);

    res.redirect('/courses');
};

const updateCourse = (req, res) => {
    const course = courses.find(
        course => course.id === Number(req.params.id)
    );

    if (!course) {
        return res.status(404).render('404', {
            url: req.originalUrl
        });
    }

    const { title, teacher, credits, semester, description } = req.body;

    course.title = title.trim();
    course.teacher = teacher.trim();
    course.credits = Number(credits);
    course.semester = Number(semester);
    course.description = description.trim();

    res.redirect(`/courses/${course.id}`);
};

const deleteCourse = (req, res) => {
    const index = courses.findIndex(
        course => course.id === Number(req.params.id)
    );

    if (index === -1) {
        return res.status(404).json({
            error: 'Course not found'
        });
    }

    const deletedCourse = courses.splice(index, 1)[0];

    res.redirect('/courses');
};

const searchCourses = (req, res) => {
    const title = req.query.title;

    if (!title) {
        return res.status(400).json({
            error: 'Title query parameter is required'
        });
    }

    const result = courses.filter(course =>
        course.title.toLowerCase().includes(title.toLowerCase())
    );

    res.json(result);
};

const getStatistics = (req, res) => {
    const totalCredits = courses.reduce(
        (sum, course) => sum + course.credits,
        0
    );

    const semesters = new Set(
        courses.map(course => course.semester)
    );

    res.json({
        coursesCount: courses.length,
        totalCredits,
        semestersCount: semesters.size
    });
};

const getCreateForm = (req, res) => {
    res.render('courses/create', {
        title: 'Добавить курс',
        errors: [],
        formData: {}
    });
};

const getEditForm = (req, res) => {
    const course = courses.find(
        course => course.id === Number(req.params.id)
    );

    if (!course) {
        return res.status(404).render('404', {
            url: req.originalUrl
        });
    }

    res.render('courses/edit', {
        title: 'Редактировать курс',
        course,
        errors: []
    });
};

module.exports = {
    getCourses,
    getCreateForm,
    getCourseById,
    getEditForm,
    addCourse,
    updateCourse,
    deleteCourse,
    searchCourses,
    getStatistics
};

