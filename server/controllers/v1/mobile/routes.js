const express = require('express');
const router = express.Router();

const user = require('./user/routes');
const requestAdmin = require('./request-admin/routes');
const shopInventory = require('./shop-inventory/routes');
const requestBooking = require('./request-booking/routes');
const feedback = require('./feedback/routes');
const shop = require('./shop/routes');
const requestedSupplier = require('./requested-supplier/routes');
const cart = require('./cart/routes');
const supplier = require('./supplier/routes');

router.use('/user', user);
router.use('/request-admin', requestAdmin);
router.use('/feedback',feedback);
router.use('/shop-inventory',shopInventory);
router.use('/request-booking', requestBooking);
router.use('/shop',shop);
router.use('/request-supplier', requestedSupplier);
router.use('/cart', cart);
router.use('/supplier',supplier);

module.exports = router;
