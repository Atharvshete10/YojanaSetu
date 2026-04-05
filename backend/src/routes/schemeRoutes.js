const express = require('express');
const router = express.Router();
const { getAllSchemes } = require('../controllers/schemeController');

router.get('/', getAllSchemes);

module.exports = router;

