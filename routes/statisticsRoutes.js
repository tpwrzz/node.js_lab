const express = require('express');
const {getStatistics} = require('../controllers/statisticsController');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', isAdmin, getStatistics);

module.exports = router;