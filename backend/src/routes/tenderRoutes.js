const express = require('express');
const router = express.Router();
const { getAllTenders } = require('../controllers/tenderController');

router.get('/', getAllTenders);

module.exports = router;

