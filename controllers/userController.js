// backend/controllers/userController.js

const User = require('../models/User');
const asyncHandler = require('express-async-handler'); // Asinxron funksiyaları idarə etmək üçün

// @desc    Cari istifadəçinin profilini al
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res) => {
    // req.user obyektini authMiddleware-də əlavə edirik
    const user = await User.findById(req.user._id).select('-password'); // Şifrəni qaytarma

    if (user) {
        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } else {
        res.status(404);
        throw new Error('İstifadəçi tapılmadı.');
    }
});

// @desc    Cari istifadəçinin profilini yenilə
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id); // Yalnız öz profilini yeniləyə bilər

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }
        // Əlavə sahələr varsa əlavə edin

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } else {
        res.status(404);
        throw new Error('İstifadəçi tapılmadı.');
    }
});

// @desc    Bütün istifadəçiləri al (yalnız admin üçün)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password'); // Bütün istifadəçiləri şifrəsiz gətir
    res.status(200).json({
        success: true,
        count: users.length,
        data: users,
    });
});

// @desc    İstifadəçini ID-yə görə al (yalnız admin üçün)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        res.status(200).json({
            success: true,
            data: user,
        });
    } else {
        res.status(404);
        throw new Error('İstifadəçi tapılmadı.');
    }
});

// @desc    İstifadəçini sil (yalnız admin üçün)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne(); // Mongoose 6+ üçün .remove() yerinə .deleteOne() istifadə edin
        res.status(200).json({
            success: true,
            message: 'İstifadəçi uğurla silindi.'
        });
    } else {
        res.status(404);
        throw new Error('İstifadəçi tapılmadı.');
    }
});

// @desc    İstifadəçi rolunu yenilə (yalnız admin üçün)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.role = req.body.role || user.role;
        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            },
            message: 'İstifadəçi rolu uğurla yeniləndi.'
        });
    } else {
        res.status(404);
        throw new Error('İstifadəçi tapılmadı.');
    }
});
