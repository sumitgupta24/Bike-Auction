const express = require('express');
const adminController = require('../controllers/admin.controller');
const protect = require('../middleware/protect');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.post('/listings/:id/approve', protect, requireRole('admin'), adminController.approveListing);

module.exports = router;
