const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;
const multer = require('multer');
const path = require('path');
const upload = require('../../../../config/middlewares/upload');
const event = require('./event');
const { validate } = require('../../../../config/middlewares/utils');
const DIR_PATH_EXCEL = 'assets/excel';

app.get(
  '/getEventListing',
  // authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),
  event.getEventListing
);

app.get(
  '/getAllEventListing',
  // authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),
  event.getAllEventListing
);
app.post(
  '/createEvent',
  authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),
  upload.single('image'),
  validate('event'),
  event.createEvent
);

app.put(
  '/updateEvent/:id',
  authHandler.authenticateJWT([
    roles.usersRoles.SUPER_ADMIN,
    roles.usersRoles.ADMIN,
  ]),
  upload.single('image'),
  validate('updateEvent'),
  event.updateEvent
);
// updateEventStatus
app.put(
  "/updateEventStatus/:id",
  authHandler.authenticateJWT([
    roles.usersRoles.SUPER_ADMIN,
    roles.usersRoles.ADMIN,
  ]),
  event.updateEventStatus
);

app.get('/getEventById/:id', event.getEventById);
app.delete(
  '/deleteEvent/:id',
  authHandler.authenticateJWT([
    roles.usersRoles.SUPER_ADMIN,
    roles.usersRoles.ADMIN,
  ]),
  event.deleteEvent
);
module.exports = app;
