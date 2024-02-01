const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;

const user = require('./user');

app.post('/signup', user.create);

app.post('/login', user.login);

app.get(
	'/profile',
	authHandler.authenticateJWT([
		roles.usersRoles.SHOP_KEEPER,
		roles.usersRoles.SUPPLIER,
		roles.usersRoles.CUSTOMER,
		roles.usersRoles.EMPLOYEE,
	]),
	user.getProfile
);

app.put(
	'/update',
	authHandler.authenticateJWT([
		roles.usersRoles.SHOP_KEEPER,
		roles.usersRoles.SUPPLIER,
		roles.usersRoles.CUSTOMER,
		roles.usersRoles.EMPLOYEE,
	]),
	user.updateProfile
);

app.post('/email-verify', user.emailVerify);

app.post('/fb-login', user.fbLogin);

app.post('/google-login', user.googleLogin);

app.post('/send-token', user.sendToken);

app.post('/verify-token', user.verifyToken);

app.post('/reset-password', user.resetPassword);

module.exports = app;
