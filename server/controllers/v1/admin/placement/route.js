const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;
const multer = require('multer');
const path = require('path');
const upload = require('../../../../config/middlewares/upload');
const placement = require('./placement');
const { validate } = require('../../../../config/middlewares/utils');
const DIR_PATH_EXCEL = 'assets/excel';

app.get(
    '/getListing', placement.getPlacementListing
);
app.post(
    '/createplacement',
    // authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),
    upload.single('image'),
    validate('placement'),
    placement.createPlacement
);

app.put(
    '/update/:id',
    // // authHandler.authenticateJWT([
    // //     roles.usersRoles.SUPER_ADMIN,
    //     roles.usersRoles.ADMIN,
    // ]),
    upload.single('image'),
    validate('updatePlacement'),
    placement.updatePlacement
);
app.get('/getById/:id', placement.getPlacementById);

app.delete(
    '/delete/:id',
    // authHandler.authenticateJWT([
    //     roles.usersRoles.SUPER_ADMIN,
    //     roles.usersRoles.ADMIN,
    // ]),
    placement.deletePlacement
);
module.exports = app;
