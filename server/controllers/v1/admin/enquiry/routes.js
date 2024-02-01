const app = require('express')();
const authHandler = require('../../../../config/middlewares/auth.middleware');
const roles = require('../../../../config/options/global.options').OPTIONS;
const multer = require('multer');
const path = require('path');
const { validate } = require('../../../../config/middlewares/utils');
const DIR_PATH_EXCEL = 'assets/excel';
const upload = require('../../../../config/middlewares/upload');
const enquiry = require('./enquiry');

app.post(
  '/createEnquiry',
  // authHandler.authenticateJWT([
  //   roles.usersRoles.SUPER_ADMIN,
  //   roles.usersRoles.ADMIN,
  // ]),

  // validate('enquiry'),
  enquiry.createEnquiry
);
app.get(
  '/getEnquiryListing',
  // authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),

  enquiry.getEnquiryListing
);
app.get('/getEnquiryById/:id', enquiry.getEnquiryById);

// app.get('/getTopicByParentId/:parentId', topic.getTopicByParentId);

app.get(
  '/change-status/:id',
  authHandler.authenticateJWT([
    roles.usersRoles.SUPER_ADMIN,
    roles.usersRoles.ADMIN,
  ])
  // topic.changeStatus
);
app.delete(
  '/deleteEnquiry/:id',
  authHandler.authenticateJWT([
    roles.usersRoles.SUPER_ADMIN,
    roles.usersRoles.ADMIN,
  ]),
  enquiry.deleteEnquiry
);

app.put(
  '/updateEnquiry/:id',
  authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),
  enquiry.updateEnquiry
);
app.get(
  '/downloadFile',
  // authHandler.authenticateJWT([roles.usersRoles.SUPER_ADMIN]),
  enquiry.downloadFile
);
// let postUploadExcel = multer({
//     storage: multer.diskStorage({
//         destination: function (req, file, callback) {
//             callback(null, DIR_PATH_EXCEL);
//         },
//         filename: function (req, file, cb) {
//             cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
//         },
//     }),
// });
// app.post(
//     "/bulk-upload",
//     authHandler.authenticateJWT(roles.usersRoles.getAllRolesAsArray()),
//     postUploadExcel.single("file"),
//     product.bulkUpload
// );
// app.post("/create", authHandler.authenticateJWT([roles.usersRoles.CUSTOMER]), cart.addToCart);
// app.put("/update/:id", authHandler.authenticateJWT([roles.usersRoles.CUSTOMER]), cart.updateCartItemQuantity);
// app.delete("/delete-item/:id", authHandler.authenticateJWT([roles.usersRoles.CUSTOMER]), cart.deleteCartItem);
// app.delete("/delete/:id", authHandler.authenticateJWT([roles.usersRoles.CUSTOMER]), cart.deleteCart);
// app.get("/listing", authHandler.authenticateJWT([roles.usersRoles.CUSTOMER]), cart.getCartListing);

module.exports = app;
