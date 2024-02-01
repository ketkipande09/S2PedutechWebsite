const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;
const multer = require('multer');
const path = require('path');
const upload = require('../../../../config/middlewares/upload');
const client = require('./client');
const { validate } = require('../../../../config/middlewares/utils');
const DIR_PATH_EXCEL = 'assets/excel';

app.get(
    '/getListing',client.getClientListing
);
app.post(
    '/create',
    authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),
    upload.single('image'),
    
    client.createClient
);

app.put(
    '/update/:id',
    authHandler.authenticateJWT([
        roles.usersRoles.SUPER_ADMIN,
        roles.usersRoles.ADMIN,
    ]),
    upload.single('image'),
    client.updateClient
);
app.get('/getById/:id', client.getClientById);
app.delete(
    '/delete/:id',
    authHandler.authenticateJWT([
        roles.usersRoles.SUPER_ADMIN,
        roles.usersRoles.ADMIN,
    ]),
    client.deleteClient
);
module.exports = app;
