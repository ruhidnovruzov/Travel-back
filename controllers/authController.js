// backend/controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken'); // JWT token yaratmaq üçün
const asyncHandler = require('express-async-handler'); // Asinxron funksiyaları idarə etmək üçün (xətaları avtomatik tutar)

// JWT token yaratmaq funksiyası
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token 30 gün sonra etibarsız olacaq
    });
};

// Tokeni çərəzdə göndərmək funksiyası
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
        httpOnly: true, // JavaScript-dən çərəzə daxil olmağı qadağan edir (XSS hücumlarından qoruyur)
        secure: process.env.NODE_ENV === 'production' ? true : false, // Yalnız HTTPS üzərindən göndər (production-da true olmalıdır)
        sameSite: 'strict', // CSRF hücumlarından qoruma
    };

    // Frontend (React) fərqli domen və ya portda işləyirsə `sameSite: 'none'` və `secure: true` istifadə edin.
    // Lakin bu zaman `credentials: true` CORS ayarını da Frontend tərəfdə verməlisiniz.
    if (process.env.NODE_ENV === 'production') {
        options.sameSite = 'none'; // Production-da "cross-site" tələblərə icazə vermək üçün
        options.secure = true;
    }


    res.status(statusCode)
        .cookie('token', token, options) // 'token' adlı çərəzi göndər
        .json({
            success: true,
            token, // Tokeni responseda da göndərmək (debug və ya mobil üçün)
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
};


// @desc    Yeni istifadəçi qeydiyyatı
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Bütün sahələrin daxil edildiyini yoxla
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Zəhmət olmasa bütün sahələri daxil edin.');
    }

    // Emailin artıq istifadə olunub-olmadığını yoxla
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('Bu email ilə artıq istifadəçi qeydiyyatdan keçmişdir.');
    }

    // Yeni istifadəçi yarat
    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        sendTokenResponse(user, 201, res);
    } else {
        res.status(400);
        throw new Error('İstifadəçi yaradıla bilmədi.');
    }
});

// @desc    İstifadəçi daxil olması
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Bütün sahələrin daxil edildiyini yoxla
    if (!email || !password) {
        res.status(400);
        throw new Error('Zəhmət olmasa email və şifrəni daxil edin.');
    }

    // İstifadəçini emailinə görə tap
    const user = await User.findOne({ email }).select('+password'); // Şifrəni də gətir

    if (!user) {
        res.status(401); // Unauthorized
        throw new Error('Yanlış email və ya şifrə.');
    }

    // Daxil edilmiş şifrəni yoxla
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        res.status(401); // Unauthorized
        throw new Error('Yanlış email və ya şifrə.');
    }

    sendTokenResponse(user, 200, res);
});

// @desc    İstifadəçi sistemdən çıxışı (Logout)
// @route   GET /api/auth/logout
// @access  Private (Əslində frontend tərəfində çərəzi silmək daha məqsədəuyğundur)
// Lakin backend-dən də çərəzi silmək üçün bu endpointi yaradırıq.
exports.logoutUser = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000), // Tokeni tez bitir (10 saniyə)
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        sameSite: 'strict',
    });

    if (process.env.NODE_ENV === 'production') {
        res.options.sameSite = 'none';
        res.options.secure = true;
    }

    res.status(200).json({
        success: true,
        message: 'Sistemdən uğurla çıxış edildi.',
    });
});

// @desc    Cari istifadəçinin profilini al
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    // req.user obyektini authMiddleware-də əlavə edəcəyik
    const user = await User.findById(req.user._id).select('-password'); // Şifrəni qaytarma

    if (!user) {
        res.status(404);
        throw new Error('İstifadəçi tapılmadı.');
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});