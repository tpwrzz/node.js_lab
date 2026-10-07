const { Teacher, Course } = require('../models');

const getStatistics = async (req, res) => {
    try {
        const teachers = await Teacher.findAll({
            include: {
                model: Course,
                attributes: ['id', 'semester']
            },
            order: [['name', 'ASC']]
        });

        const courses = await Course.findAll({
            attributes: ['id', 'semester']
        });

        const teachersCount = teachers.length;
        const coursesCount = courses.length;

        const coursesBySemester = {};

        for (let semester = 1; semester <= 8; semester++) {
            coursesBySemester[semester] = 0;
        }

        courses.forEach(course => {
            coursesBySemester[course.semester]++;
        });

        const coursesByTeacher = teachers.map(teacher => ({
            name: teacher.name,
            count: teacher.Courses.length
        }));

        let teacherWithMostCourses = null;

        if (coursesByTeacher.length > 0) {
            teacherWithMostCourses = coursesByTeacher.reduce(
                (max, teacher) =>
                    teacher.count > max.count ? teacher : max
            );
        }

        res.render('statistics', {
            title: 'Статистика',
            teachersCount,
            coursesCount,
            coursesBySemester,
            coursesByTeacher,
            teacherWithMostCourses
        });
    } catch (error) {
        console.error('Error getting statistics:', error);

        res.status(500).render('error', {
            title: 'Ошибка',
            message: 'Не удалось загрузить статистику'
        });
    }
};

module.exports = {
    getStatistics
};