const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;

const feedback = require('./feedback');

app.post(
	'/create',
	authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN,
		roles.usersRoles.ADMIN,
		roles.usersRoles.SHOP_KEEPER,
		roles.usersRoles.SUPPLIER,
		roles.usersRoles.CUSTOMER,
		roles.usersRoles.EMPLOYEE,]),
	feedback.create
);

module.exports=app;