const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;

const shop = require('./shop');


app.get(
	'/supplier-listing',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER]),
	shop.supplierList
);

app.post(
	'/supplier-create',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER]),
	shop.supplierCreate
);

app.get(
	'/supplier-view/:id',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER,roles.usersRoles.EMPLOYEE]),
	shop.supplierView
);
app.put(
	'/supplier-change-status/:id',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER]),
	shop.supplierChangeStatus
);

app.put(
	'/supplier-update/:id',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER]),
	shop.supplierUpdate
);

app.post(
	'/employee-create',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER]),
	shop.employeeCreate
);

app.put(
	'/employee-change-status/:id',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER]),
	shop.employeeChangeStatus
);

app.get(
	'/employee-listing',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER]),
	shop.employeeList
);

app.get(
	'/employee-view/:id',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER]),
	shop.employeeView
);

app.put(
	'/employee-update/:id',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER]),
	shop.employeeUpdate
);

app.delete(
	'/employee-delete/:id',
    authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER]),
    shop.employeeDelete
);

app.put(
	'/shop-update/:id',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER]),
	shop.shopUpdate
);

module.exports = app;

