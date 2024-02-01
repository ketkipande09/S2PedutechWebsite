const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;
const multer = require('multer');
const path = require('path');
const upload = require('../../../../config/middlewares/upload');
const course = require('./courses');
const { validate } = require('../../../../config/middlewares/utils');
const DIR_PATH_EXCEL = 'assets/excel';

app.get(
  '/getCourseListing',
  // authHandler.authenticateJWT([
  //   roles.usersRoles.SUPER_ADMIN,
  //   roles.usersRoles.ADMIN,
  // ]),
  course.getCourseListing
);

app.post(
  '/createCourse',
  authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),
  upload.single('image'),
  validate('course'),
  course.createCourse
);

app.get('/getCourseById/:id', course.getCourseById);

app.get(
  '/change-status/:id',
  // authHandler.authenticateJWT([
  //   roles.usersRoles.SUPER_ADMIN,
  //   roles.usersRoles.ADMIN,
  // ]),
  course.changeStatus
);
app.delete(
  '/deleteCourse/:id',
  authHandler.authenticateJWT([
    roles.usersRoles.SUPER_ADMIN,
    roles.usersRoles.ADMIN,
  ]),
  course.deleteCourse
);

app.put(
  '/updateCourse/:id',

  authHandler.authenticateJWT([
    roles.usersRoles.SUPER_ADMIN,
    roles.usersRoles.ADMIN,
  ]),
  upload.single('image'),
  validate('updateCourse'),
  course.updateCourse
);

app.delete(
  '/delete-image',
  authHandler.authenticateJWT([
    roles.usersRoles.SUPER_ADMIN,
    roles.usersRoles.ADMIN,
  ]),
  course.deleteImage
);



module.exports = app;
