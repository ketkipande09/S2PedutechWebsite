const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;
const multer = require('multer');
const path = require('path');
const { validate } = require('../../../../config/middlewares/utils');
const home = require('./home');
const DIR_PATH_EXCEL = 'assets/excel';
const upload = require('../../../../config/middlewares/upload');

app.post(
  '/create',
  //   authHandler.authenticateJWT([
  //     roles.usersRoles.SUPER_ADMIN,
  //     roles.usersRoles.ADMIN,
  //   ]),
  upload.single('image'),
  validate('home'),
  home.createHome
);
app.get(
  '/getListing',
  // authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),

  home.getHomeListing
);
app.get('/getById/:id', home.getHomeById);
app.delete(
  '/delete/:id',
//   authHandler.authenticateJWT([
//     roles.usersRoles.SUPER_ADMIN,
//     roles.usersRoles.ADMIN,
//   ]),
  home.deleteHome
);

app.put(
  '/update/:id',
  //   authHandler.authenticateJWT([
  //     roles.usersRoles.SUPER_ADMIN,
  //     roles.usersRoles.ADMIN,
  //   ]),
  upload.single('image'),
  home.updateHome
);

module.exports = app;
