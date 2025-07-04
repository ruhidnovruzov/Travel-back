// backend/routes/authRoutes.js

const express = require('express');
const { registerUser, loginUser, logoutUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // authMiddleware-i daxil edirik

const router = express.Router();

router.post('/register', registerUser); // Qeydiyyat
router.post('/login', loginUser);       // Daxil olma
router.get('/logout', logoutUser);      // Çıxış
router.get('/me', protect, getMe);      // Cari istifadəçi profilini almaq (qorunan marşrut)

module.exports = router;