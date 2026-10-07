# Course Management System

## Description

This project is a web application for managing university courses and teachers.

The project was developed step by step during Laboratory Works №3, №4 and №5. It started as a simple Express.js application with data stored in an array and was later extended with PostgreSQL, Sequelize, authentication, authorization and real-time notifications.

### Main Features

The application allows users to:

* view courses and teachers;
* add, edit and delete courses;
* add, edit and delete teachers;
* search and filter courses;
* view course and teacher details;
* view application statistics;
* register and log in;
* log out and view a personal profile;
* use different permissions for `user` and `admin` roles;
* receive notifications when a new course is created.

## Technologies

* Node.js
* Express.js
* EJS
* PostgreSQL
* Sequelize
* bcrypt
* express-session
* express-validator
* Morgan
* Socket.IO
* dotenv
* HTML/CSS

## Project Structure

```text
project/
├── app.js
├── config/
│   └── database.js
├── routes/
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   └── teacherRoutes.js
├── controllers/
│   ├── authController.js
│   ├── courseController.js
│   └── teacherController.js
├── models/
│   ├── index.js
│   ├── User.js
│   ├── Course.js
│   └── Teacher.js
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   ├── logger.js
│   ├── notFound.js
│   └── errorHandler.js
├── views/
│   ├── auth/
│   ├── courses/
│   ├── teachers/
│   ├── partials/
│   ├── profile.ejs
│   ├── 403.ejs
│   ├── 404.ejs
│   └── error.ejs
├── public/
│   ├── css/
│   └── js/
├── logs/
├── .env
└── package.json
```

## Database

The application uses **PostgreSQL** with **Sequelize**.

There are three main models:

* `User` — application users and their roles;
* `Teacher` — teacher information;
* `Course` — course information.

A teacher can have multiple courses, while each course belongs to one teacher.

Database connection settings are stored in `.env` and are not included in the project repository.

## Authentication and Authorization

The application supports registration and login.

Passwords are hashed using **bcrypt** before being saved to the database. User sessions are handled with **express-session**.

There are two roles:

* `user` — can view courses and teachers, use search and filters, view the profile and statistics;
* `admin` — has additional permissions to create, edit and delete courses and teachers.

Protected routes use authentication and authorization middleware.

## Validation and Error Handling

Form data is validated using **express-validator**.

The application also has centralized error handling for cases such as:

* invalid input;
* incorrect login data;
* missing records;
* duplicate email;
* unauthorized access;
* insufficient permissions;
* database errors.

Separate `403`, `404` and general error pages are used.

## Logging and Notifications

**Morgan** is used for HTTP request logging. Requests are also saved in:

```text
logs/requests.log
```

Administrator actions such as creating, editing and deleting courses or teachers are logged in the terminal.

**Socket.IO** is used for real-time notifications. When an administrator creates a new course, other open pages receive a notification without reloading the page.

## Running the Project

Install the dependencies:

```bash
npm install
```

Create a PostgreSQL database and configure the `.env` file with the database and session settings.

Then start the application:

```bash
node app.js
```

The application is available at:

```text
http://localhost:3000
```
