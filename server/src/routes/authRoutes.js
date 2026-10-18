const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/me', authController.getMe);
router.get('/users', authController.getUsers);
router.post('/replace-initial-admin', authController.replaceInitialAdmin);

module.exports = router;