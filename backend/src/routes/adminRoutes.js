const express = require('express');
const router = express.Router();
const { login } = require('../controllers/admin/authController');
const { getStats } = require('../controllers/statController');
const { getLogs } = require('../controllers/admin/logsController');
const { getPending, getById, approve, reject } = require('../controllers/admin/moderationController');
const { getStatus, triggerCrawler } = require('../controllers/admin/crawlerController');

// Auth
router.post('/login', login);

// Stats & Logs
router.get('/stats', getStats);
router.get('/logs', getLogs);

// Moderation
router.get('/pending', getPending);
router.get('/pending/:id', getById);
router.post('/pending/:id/approve', approve);
router.post('/pending/:id/reject', reject);

// Crawler Control
router.get('/crawler/status', getStatus);
router.post('/crawler/trigger', triggerCrawler);

module.exports = router;
