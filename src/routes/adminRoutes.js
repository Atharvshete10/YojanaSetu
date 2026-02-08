const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Controllers
const authController = require('../controllers/admin/authController');
const moderationController = require('../controllers/admin/moderationController');
const crawlerController = require('../controllers/admin/crawlerController');
const logsController = require('../controllers/admin/logsController');

// ============================================
// PUBLIC ADMIN ROUTES (No Auth Required)
// ============================================

// Login
router.post('/login', authLimiter, authController.login);

// ============================================
// PROTECTED ADMIN ROUTES (Auth Required)
// ============================================

// Profile
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);

// Moderation - Pending Reviews
router.get('/pending', verifyToken, moderationController.getPending);
router.get('/pending/:id', verifyToken, moderationController.getById);
router.put('/pending/:id', verifyToken, moderationController.update);
router.post('/pending/:id/approve', verifyToken, moderationController.approve);
router.post('/pending/:id/reject', verifyToken, moderationController.reject);

// Crawler Management
router.get('/sources', verifyToken, crawlerController.getSources);
router.post('/crawler/trigger', verifyToken, crawlerController.triggerCrawler);
router.get('/crawl-jobs', verifyToken, crawlerController.getCrawlJobs);
router.get('/crawl-jobs/:id', verifyToken, crawlerController.getCrawlJobById);

// MyScheme Crawler Control (Enhanced)
router.post('/crawler/myscheme/start', verifyToken, crawlerController.startMySchemeCrawler);
router.post('/crawler/myscheme/pause', verifyToken, crawlerController.pauseMySchemeCrawler);
router.post('/crawler/myscheme/stop', verifyToken, crawlerController.stopMySchemeCrawler);
router.get('/crawler/myscheme/status', verifyToken, crawlerController.getMySchemeCrawlerStatus);
router.get('/crawler/myscheme/jobs', verifyToken, crawlerController.getMySchemeJobs);

// Logs & Stats
router.get('/logs', verifyToken, logsController.getAuditLogs);
router.get('/stats', verifyToken, logsController.getStats);

// ============================================
// ADMIN-ONLY ROUTES (Admin Role Required)
// ============================================

router.get('/admins', verifyToken, requireRole('admin'), authController.getAllAdmins);
router.post('/admins', verifyToken, requireRole('admin'), authController.createAdmin);

module.exports = router;
