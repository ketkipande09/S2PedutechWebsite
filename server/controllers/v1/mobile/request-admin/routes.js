const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;

const requestAdmin = require('./request-admin');


app.get(
	'/listing',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER,roles.usersRoles.EMPLOYEE]),
	requestAdmin.listing
);

app.post(
	'/create',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER,roles.usersRoles.EMPLOYEE]),
	requestAdmin.create
);

app.delete(
	'/delete/:id',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER,roles.usersRoles.EMPLOYEE]),
	requestAdmin.delete);
	
module.exports = app;