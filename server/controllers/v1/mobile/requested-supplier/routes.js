const app = require("express")();
const authHandler = require("../../../../config/middlewares/auth.middleware");
const roles = require("../../../../config/options/global.options").OPTIONS;

const requestedSupplier = require("./requested-supplier");

app.get(
    "/listing",
    authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER, roles.usersRoles.SUPPLIER]),
    requestedSupplier.listing
);

app.post("/create", authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER]), requestedSupplier.create);

app.put(
    "/change-status/:id",
    authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER, roles.usersRoles.SUPPLIER]),
    requestedSupplier.changeStatus
);

app.put(
    "/change-status-item/:id",
    authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER, roles.usersRoles.SUPPLIER]),
    requestedSupplier.changeStatusItem
);

app.get(
    "/view/:id",
    authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER, roles.usersRoles.SUPPLIER]),
    requestedSupplier.viewSupplierRequest
);
app.put(
    "/update-item/:id",
    authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER, roles.usersRoles.SUPPLIER]),
    requestedSupplier.update
);

app.delete(
    "/delete/:id",
    authHandler.authenticateJWT([roles.usersRoles.SHOP_KEEPER, roles.usersRoles.SUPPLIER]),
    requestedSupplier.delete
);

module.exports = app;
