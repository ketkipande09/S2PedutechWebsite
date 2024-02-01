const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;

const shopInventory = require('./shop-inventory');

app.get(
    "/category-listing",
    authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER, roles.usersRoles.EMPLOYEE]),
    shopInventory.categoryListing
);
app.get(
    "/product-listing",
    authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER, roles.usersRoles.EMPLOYEE]),
    shopInventory.productListing
);

app.get(
    "/view/:id",
    authHandler.authenticateJWT([roles.usersRoles.EMPLOYEE, roles.usersRoles.SHOP_KEEPER]),
    shopInventory.viewShopInventory
);

app.post('/create',authHandler.authenticateJWT([
    roles.usersRoles.SHOP_KEEPER,
    roles.usersRoles.EMPLOYEE,
]),shopInventory.create);

app.put(
	'/update/:id',
	authHandler.authenticateJWT([
		roles.usersRoles.SHOP_KEEPER,
		roles.usersRoles.EMPLOYEE,
	]),
	shopInventory.update
);

app.put(
	'/change-status/:id',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER, roles.usersRoles.EMPLOYEE]),
	shopInventory.changeStatus
);

app.put(
	'/change-stock/:id',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER]),
	shopInventory.changeStock
);

module.exports = app;