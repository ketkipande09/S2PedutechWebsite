const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;

const supplier = require('./supplier');

app.put(
	'/update/:id',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER,roles.usersRoles.SUPPLIER,roles.usersRoles.EMPLOYEE]),
	supplier.update
);

app.get(
	'/view/:id',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER,roles.usersRoles.SUPPLIER,roles.usersRoles.EMPLOYEE]),
	supplier.viewSupplier
);

module.exports = app;