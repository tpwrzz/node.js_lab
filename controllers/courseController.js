const { Courses } = require('../models/courseModel');

const getCourses = (req, res) => {
    let result = Courses;

    if (req.query.semester) {
        result = result.filter(
            course => course.semester === Number(req.query.semester)
        );
    }

    if (req.query.teacher) {
        result = result.filter(
            course => course.teacher.toLowerCase() === req.query.teacher.toLowerCase()
        );
    }

    res.render('courses/index', {
        title: 'Courses',
        courses: result
    });
};

const getCourseById = (req, res) => {
    const course = Courses.find(
        course => course.id === Number(req.params.id)
    );

    if (!course) {
        return res.status(404).json({
            error: 'Course not found'
        });
    }

    res.json(course);
};

const addCourse = (req, res) => {
    const { title, teacher, credits, semester, description } = req.body;

    if (!title || !teacher || !credits || !semester || !description) {
        return res.status(400).json({
            error: 'All fields are required'
        });
    }

    const newCourse = {
        id: Courses.length > 0
            ? Math.max(...Courses.map(course => course.id)) + 1
            : 1,
        title,
        teacher,
        credits: Number(credits),
        semester: Number(semester),
        description
    };

    Courses.push(newCourse);

    res.status(201).json(newCourse);
};

const updateCourse = (req, res) => {
    const course = Courses.find(
        course => course.id === Number(req.params.id)
    );

    if (!course) {
        return res.status(404).json({
            error: 'Course not found'
        });
    }

    const { title, teacher, credits, semester, description } = req.body;

    if (title !== undefined) course.title = title;
    if (teacher !== undefined) course.teacher = teacher;
    if (credits !== undefined) course.credits = Number(credits);
    if (semester !== undefined) course.semester = Number(semester);
    if (description !== undefined) course.description = description;

    res.status(200).json(course);
};

const deleteCourse = (req, res) => {
    const index = Courses.findIndex(
        course => course.id === Number(req.params.id)
    );

    if (index === -1) {
        return res.status(404).json({
            error: 'Course not found'
        });
    }

    const deletedCourse = Courses.splice(index, 1)[0];

    res.status(200).json(deletedCourse);
};

const searchCourses = (req, res) => {
    const title = req.query.title;

    if (!title) {
        return res.status(400).json({
            error: 'Title query parameter is required'
        });
    }

    const result = Courses.filter(course =>
        course.title.toLowerCase().includes(title.toLowerCase())
    );

    res.json(result);
};

const getStatistics = (req, res) => {
    const totalCredits = Courses.reduce(
        (sum, course) => sum + course.credits,
        0
    );

    const semesters = new Set(
        Courses.map(course => course.semester)
    );

    res.json({
        coursesCount: Courses.length,
        totalCredits,
        semestersCount: semesters.size
    });
};

module.exports = {
    getCourses,
    getCourseById,
    addCourse,
    updateCourse,
    deleteCourse,
    searchCourses,
    getStatistics
};

