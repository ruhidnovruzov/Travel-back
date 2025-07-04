// backend/routes/bookingRoutes.js

const express = require('express');
const {
    createBooking,
    getMyBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
    getAllBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Yeni rezervasiya yarat (Private)
router.post('/', protect, createBooking);

// İstifadəçinin öz rezervasiyalarını al (Private)
router.get('/my', protect, getMyBookings);

// Admin üçün bütün rezervasiyaları al (Private/Admin)
router.get('/', protect, authorize('admin'), getAllBookings);

// Rezervasiyanı ID-yə görə al (Private)
// Rezervasiyanın statusunu yenilə (Private/Admin)
// Rezervasiyanı ləğv et (Private)
router.route('/:id')
    .get(protect, getBookingById) // Admin və ya rezervasiyanı edən istifadəçi
    .put(protect, authorize('admin'), updateBookingStatus); // Yalnız admin
router.put('/cancel/:id', protect, cancelBooking); // Admin və ya rezervasiyanı edən istifadəçi

module.exports = router;
