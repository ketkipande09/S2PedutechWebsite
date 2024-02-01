const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;
const { validate } = require('../../../../config/middlewares/utils');
const User = require('./portalRegistration');

app.get('/getAllUsers', User.getAllEventRegisters);

app.post('/create', User.create);

app.delete('/delete/:id', User.deleteEventRegister);

app.put('/updateRegistration/:id', User.updateProfile);

app.get('/studentGetById/:id', User.getStudenkById);

app.get('/downloadFile', User.downloadFile);

module.exports = app;
