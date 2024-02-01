const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;
const multer = require('multer');
const path = require('path');
const upload = require('../../../../config/middlewares/upload');
const slider = require('./slider');
const { validate } = require('../../../../config/middlewares/utils');
const DIR_PATH_EXCEL = 'assets/excel';

app.get(
  '/getListing',
  // authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),
  slider.getSliderListing
);
app.post(
  '/create',
  authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),
  upload.single('image'),
  // validate('slider'),
  slider.createSlider
);

app.put(
  '/update/:id',
  authHandler.authenticateJWT([
    roles.usersRoles.SUPER_ADMIN,
    roles.usersRoles.ADMIN,
  ]),
  upload.single('image'),
  slider.updateSlider
);
app.get('/getById/:id', slider.getSliderById);
app.delete(
  '/delete/:id',
  authHandler.authenticateJWT([
    roles.usersRoles.SUPER_ADMIN,
    roles.usersRoles.ADMIN,
  ]),
  slider.deleteSlider
);
module.exports = app;
