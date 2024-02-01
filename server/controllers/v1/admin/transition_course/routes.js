const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;
const multer = require('multer');
const path = require('path');
const upload = require('../../../../config/middlewares/upload');
const transition_course = require('./transition_course');
const { validate } = require('../../../../config/middlewares/utils');
const DIR_PATH_EXCEL = 'assets/excel';

app.get(
  '/getListing',
  //   authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),
  transition_course.getTransitionCourse
);
app.post(
  '/create',
  // authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),
  upload.single('image'),
  validate('transition_course'),
  transition_course.createTransitionCourse
);
app.put(
  '/update/:id',
  //   authHandler.authenticateJWT([
  //     roles.usersRoles.SUPER_ADMIN,
  //     roles.usersRoles.ADMIN,
  //   ]),
  upload.single('image'),
  validate('updateTransition'),
  transition_course.updateTransitionCourse
);
app.get('/getById/:id', transition_course.getTransitionById);

app.delete(
  '/delete/:id',
  //   authHandler.authenticateJWT([
  //     roles.usersRoles.SUPER_ADMIN,
  //     roles.usersRoles.ADMIN,
  //   ]),

  transition_course.deleteTransitionCourse
);
app.put(
  "/uploadPdf/:id",
  upload.single("pdf"),
  transition_course.uploadPdf,

);
module.exports = app;
