const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

// جيب اشتراك المستخدم الحالي
router.get('/current', auth, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ 
            user: req.userId 
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: '❌ مفيش اشتراك'
            });
        }

        res.json({
            success: true,
            data: {
                plan: subscription.plan,
                planName: subscription.getPlanName(),
                status: subscription.status,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                isExpired: subscription.isExpired(),
                daysLeft: Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ خطأ في جلب الاشتراك',
            error: error.message
        });
    }
});

// ترقية الاشتراك
router.post('/upgrade', auth, async (req, res) => {
    try {
        const { plan } = req.body;

        const prices = {
            'basic': 19,
            'pro': 149
        };

        const durations = {
            'basic': 30,
            'pro': 365
        };

        if (!prices[plan]) {
            return res.status(400).json({
                success: false,
                message: '❌ الـ Plan غلط'
            });
        }

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + durations[plan]);

        const subscription = await Subscription.findOneAndUpdate(
            { user: req.userId },
            {
                plan,
                status: 'active',
                price: prices[plan],
                startDate: new Date(),
                endDate
            },
            { new: true }
        );

        res.json({
            success: true,
            message: `✅ تم الترقية لـ ${subscription.getPlanName()}`,
            data: {
                plan: subscription.plan,
                planName: subscription.getPlanName(),
                endDate: subscription.endDate,
                price: subscription.price
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ خطأ في الترقية',
            error: error.message
        });
    }
});

// كل الباقات المتاحة
router.get('/plans', async (req, res) => {
    res.json({
        success: true,
        data: [
            {
                id: 'free_trial',
                name: '🆓 Free Trial',
                price: 0,
                duration: '30 يوم',
                features: [
                    '✅ مراقبة شبكة واحدة',
                    '✅ تقارير أساسية',
                    '✅ Failover تلقائي',
                    '❌ AI Predictions',
                    '❌ Support'
                ]
            },
            {
                id: 'basic',
                name: '💳 Basic',
                price: 19,
                duration: 'شهري',
                features: [
                    '✅ مراقبة 5 شبكات',
                    '✅ تقارير متقدمة',
                    '✅ Failover تلقائي',
                    '✅ AI Predictions',
                    '✅ Email Support'
                ]
            },
            {
                id: 'pro',
                name: '💎 Pro',
                price: 149,
                duration: 'سنوي',
                features: [
                    '✅ شبكات غير محدودة',
                    '✅ تقارير مخصصة',
                    '✅ Failover تلقائي',
                    '✅ AI Predictions متقدم',
                    '✅ Priority Support 24/7'
                ]
            }
        ]
    });
});

module.exports = router;