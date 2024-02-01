const app = require('express')();
const multer = require('multer');
const path = require('path');
const OPTIONS = require('../../../config/options/global.options');
const roles = require('../../../config/options/global.options').OPTIONS;
const authHandler = require('../../../config/middlewares/auth.middleware');

const shared = require('./shared');
const DIR_PATH = './assets/uploadimages';

let postUpload = multer({
	storage: multer.diskStorage({
		destination: function (req, file, callback) {
			callback(null, DIR_PATH);
		},
		filename: function (req, file, cb) {
			cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
		},
	}),
});
app.post(
	'/upload',
	authHandler.authenticateJWT(roles.usersRoles.getAllRolesAsArray()),
	postUpload.single('file'),
	shared.postUpload
);

app.put(
	'/remove',
	authHandler.authenticateJWT(roles.usersRoles.getAllRolesAsArray()),
	shared.removeUpload
);
app.get(
	'/category',
	authHandler.authenticateJWT(roles.usersRoles.getAllRolesAsArray()),
	shared.getCategory
);

app.get(
	'/product',
	authHandler.authenticateJWT(roles.usersRoles.getAllRolesAsArray()),
	shared.getProduct
);

app.get(
	'/supplier',
	authHandler.authenticateJWT(roles.usersRoles.getAllRolesAsArray()),
	shared.getSupplier
);

module.exports = app;