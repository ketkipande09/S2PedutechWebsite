const express = require('express');

const router = express.Router();

const Api1Router = require('./routes');

router.use('/api', Api1Router);

module.exports = router;
