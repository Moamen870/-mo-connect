const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// تسجيل مستخدم جديد
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, company } = req.body;

        // تحقق لو الإيميل موجود
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '❌ الإيميل موجود بالفعل'
            });
        }

        // عمل المستخدم
        const user = new User({ name, email, password, company });
        await user.save();

        // عمل Free Trial تلقائي
        const subscription = new Subscription({
            user: user._id,
            plan: 'free_trial',
            price: 0
        });
        await subscription.save();

        // عمل Token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: '✅ تم التسجيل بنجاح - Free Trial 30 يوم',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                company: user.company
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ خطأ في التسجيل',
            error: error.message
        });
    }
});

// تسجيل الدخول
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // جيب المستخدم
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: '❌ الإيميل أو الباسورد غلط'
            });
        }

        // تحقق من الباسورد
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: '❌ الإيميل أو الباسورد غلط'
            });
        }

        // عمل Token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: '✅ تم تسجيل الدخول بنجاح',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                company: user.company
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ خطأ في تسجيل الدخول',
            error: error.message
        });
    }
});

module.exports = router;