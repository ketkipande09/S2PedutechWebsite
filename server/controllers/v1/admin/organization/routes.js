const app = require("express")();
const authHandler = require("../../../../config/middlewares/auth.middleware");
const roles = require("../../../../config/options/global.options").OPTIONS;
const multer = require("multer");
const path = require("path");
const { validate } = require("../../../../config/middlewares/utils");
const Org = require("./org");
const DIR_PATH_EXCEL = "assets/excel";

app.post(
  "/createOrg",
  authHandler.authenticateJWT([
    roles.usersRoles.SUPER_ADMIN,
    roles.usersRoles.ADMIN,
  ]),

  validate("org"),
  Org.createOrg
);

app.get(
  "/getOrgListing",
//   authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),

  Org.getOrgListing
);

app.get("/getOrgById/:id", Org.getOrgById);

// app.get('/getTopicByParentId/:parentId', topic.getTopicByParentId);

app.get(
  "/change-status/:id",
  authHandler.authenticateJWT([
    roles.usersRoles.SUPER_ADMIN,
    roles.usersRoles.ADMIN,
  ])
  // topic.changeStatus
);

app.delete(
  "/deleteOrg/:id",
  authHandler.authenticateJWT([
    roles.usersRoles.SUPER_ADMIN,
    roles.usersRoles.ADMIN,
  ]),
  Org.deleteOrg
);

app.put(
  "/updateOrg/:id",
  authHandler.authenticateJWT([
    roles.usersRoles.SUPER_ADMIN,
    roles.usersRoles.ADMIN,
  ]),
  Org.updateOrg
);

module.exports = app;
