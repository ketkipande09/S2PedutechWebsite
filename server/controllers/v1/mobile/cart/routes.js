const app = require("express")();
const authHandler = require("../../../../config/middlewares/auth.middleware");
const roles = require("../../../../config/options/global.options").OPTIONS;

const cart = require("./cart");

app.post("/create", authHandler.authenticateJWT([roles.usersRoles.CUSTOMER]), cart.addToCart);
app.put("/update/:id", authHandler.authenticateJWT([roles.usersRoles.CUSTOMER]), cart.updateCartItemQuantity);
app.delete("/delete-item/:id", authHandler.authenticateJWT([roles.usersRoles.CUSTOMER]), cart.deleteCartItem);
app.delete("/delete/:id", authHandler.authenticateJWT([roles.usersRoles.CUSTOMER]), cart.deleteCart);
app.get("/listing", authHandler.authenticateJWT([roles.usersRoles.CUSTOMER]), cart.getCartListing);

module.exports = app;
