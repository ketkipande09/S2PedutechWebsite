const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;
const multer = require('multer');
const path = require('path');

const feedback = require('./feedback');
const { validate } = require('../../../../config/middlewares/utils');
const DIR_PATH_EXCEL = 'assets/excel';

app.post(
  '/createContact',
  // authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),
  // validate('feedback'),
  feedback.createFeedback
);
app.get(
  '/getContact',
  authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),
  feedback.getFeedback
);
app.get('/getFeedbackById/:id', feedback.getFeedbackById);

app.put(
  '/updateFeedback/:id',
  // authHandler.authenticateJWT([
  //   roles.usersRoles.SUPER_ADMIN,
  //   roles.usersRoles.ADMIN,
  // ]),
  // validate('updateFeedback'),
  feedback.updateFeedback
);
app.delete(
  '/deleteFeedback/:id',
  authHandler.authenticateJWT([
    roles.usersRoles.SUPER_ADMIN,
    roles.usersRoles.ADMIN,
  ]),
  feedback.deleteFeedback
);
app.get(
  '/getEventsById/:id',

  feedback.getEventsById
);

app.get(
  '/downloadFile',
  // authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),
  feedback.downloadFile
);
module.exports = app;
