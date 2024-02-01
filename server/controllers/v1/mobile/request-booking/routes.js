const app = require("express")();
const authHandler = require("../../../../config/middlewares/auth.middleware");
const roles = require("../../../../config/options/global.options").OPTIONS;

const requestBooking = require("./request-booking");

app.get(
    "/listing",
    authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER, roles.usersRoles.EMPLOYEE]),
    requestBooking.listing
);

app.post(
    "/create", 
    authHandler.authenticateJWT([roles.usersRoles.CUSTOMER]),
     requestBooking.create);

app.get(
    "/view/:id",
    authHandler.authenticateJWT([roles.usersRoles.CUSTOMER, roles.usersRoles.EMPLOYEE, roles.usersRoles.SHOP_KEEPER]),
    requestBooking.viewBookingRequest
);

app.put(
    "/update-item/:id",
    authHandler.authenticateJWT([roles.usersRoles.CUSTOMER, roles.usersRoles.EMPLOYEE, roles.usersRoles.SHOP_KEEPER]),
    requestBooking.updateItem
);

app.put(
    "/change-status-item/:id",
    authHandler.authenticateJWT([roles.usersRoles.EMPLOYEE, roles.usersRoles.SHOP_KEEPER]),
    requestBooking.changeStatusItem
);

app.put(
    "/change-status/:id",
    authHandler.authenticateJWT([roles.usersRoles.EMPLOYEE, roles.usersRoles.SHOP_KEEPER]),
    requestBooking.changeStatus
);

app.delete(
	'/delete/:id',
	authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER]),
	requestBooking.delete
);

module.exports = app;
