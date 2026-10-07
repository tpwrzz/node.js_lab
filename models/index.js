const sequelize = require('../config/database');

const Teacher = require('./teacher');
const Course = require('./course');

Teacher.hasMany(Course, {
    foreignKey: 'teacherId',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

Course.belongsTo(Teacher, {
    foreignKey: 'teacherId'
});

module.exports = {
    sequelize,
    Teacher,
    Course
};