const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;

const { validate } = require('../../../../config/middlewares/utils');
const user = require('./user');

app.post(
  '/signup',
  // authHandler.authenticateJWT([
  //   roles.usersRoles.SUPER_ADMIN,
  //   roles.usersRoles.ADMIN,
  // ]),
  validate('create'),
  user.create
);
app.post('/login', user.login);
app.post('/listing', user.listing);
app.get('/getAllUsers', user.getAllUsers);
app.get(
  '/profile',
  authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN, roles.usersRoles.ADMIN]),
  user.getProfile
);
app.put(
  '/updateProfile',
  // authHandler.authenticateJWT([
  //   roles.usersRoles.SUPER_ADMIN,
  //   roles.usersRoles.ADMIN,
  // ]),
  // validate('updateProfile'),
  user.updateProfile
);
// app.post('/email-verify', user.emailVerify);
// app.post('/fb-login', user.fbLogin);
app.post('/google-login', user.googleLogin);
app.post('/send-token', user.sendToken);
app.post('/verify-token', user.verifyToken);
app.post('/reset-password', validate('resetPassword'), user.resetPassword);
app.post('/forgot-password', user.forgetPassword);
app.post('/set-password', user.setPassword);
// app.put(
// 	'/change-status',
// 	authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN, roles.usersRoles.ADMIN]),
// 	user.changeStatus
// );

app.delete(
  '/delete/:id',
  authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN, roles.usersRoles.ADMIN]),
  user.delete
);

// app.put(
// 	'/delete-image',
// 	authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN, roles.usersRoles.ADMIN]),
// 	user.deleteImage);

module.exports = app;
