// backend/routes/userRoutes.js

const express = require('express');
const {
    getUserProfile,
    updateUserProfile,
    getUsers,
    getUserById,
    deleteUser,
    updateUserRole
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const createUser = require('../controllers/userController').createUser; // Yeni istifadəçi yaratma funksiyasını əlavə edin

const router = express.Router();

// Cari istifadəçinin profilini al və ya yenilə (Private)
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// Admin üçün istifadəçi idarəetmə marşrutları (Private/Admin)
router.route('/')
    .get(protect, authorize('admin'), getUsers); // Bütün istifadəçiləri al

router.route('/:id')
    .get(protect, authorize('admin'), getUserById) // İstifadəçini ID-yə görə al
    .delete(protect, authorize('admin'), deleteUser); // İstifadəçini sil

router.route('/:id/role')
    .put(protect, authorize('admin'), updateUserRole); // İstifadəçi rolunu yenilə

    router.route('/')
    .post(protect, authorize('admin'), createUser) // <-- bunu əlavə edin
    .get(protect, authorize('admin'), getUsers);

module.exports = router;
