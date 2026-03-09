const express = require('express');
const router = express.Router();
const Reading = require('../models/Reading');
const User = require('../models/User');
const { sendDisconnectionAlert, sendReconnectionAlert } = require('../services/emailService');

// متغير لتتبع حالة الاتصال
let wasConnected = true;

// بيستقبل البيانات من الـ Agent
router.post('/add', async (req, res) => {
    try {
        const reading = new Reading(req.body);
        await reading.save();

        // تحقق من حالة الاتصال
        const isConnected = req.body.is_connected;

        // لو النت قطع
        if (wasConnected && !isConnected) {
            wasConnected = false;
            console.log('❌ النت قطع - بيبعت Emails...');
            
            // بعت Email لكل المستخدمين
            const users = await User.find({ isActive: true });
            for (const user of users) {
                await sendDisconnectionAlert(
                    user.email,
                    user.name,
                    req.body.latency_ms
                );
            }
        }

        // لو النت رجع
        if (!wasConnected && isConnected) {
            wasConnected = true;
            console.log('✅ النت رجع - بيبعت Emails...');
            
            // بعت Email لكل المستخدمين
            const users = await User.find({ isActive: true });
            for (const user of users) {
                await sendReconnectionAlert(
                    user.email,
                    user.name
                );
            }
        }

        res.json({ 
            success: true, 
            message: '✅ Data Saved Successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '❌ Error Saving Data',
            error: error.message 
        });
    }
});

// بيجيب آخر 100 Reading
router.get('/latest', async (req, res) => {
    try {
        const readings = await Reading.find()
            .sort({ timestamp: -1 })
            .limit(100);
        res.json({ 
            success: true, 
            data: readings 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '❌ Error Getting Data',
            error: error.message 
        });
    }
});

// بيجيب إحصائيات
router.get('/stats', async (req, res) => {
    try {
        const total = await Reading.countDocuments();
        const connected = await Reading.countDocuments({ is_connected: true });
        const disconnected = await Reading.countDocuments({ is_connected: false });
        
        res.json({ 
            success: true, 
            data: {
                total,
                connected,
                disconnected,
                uptime_percentage: ((connected / total) * 100).toFixed(2)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '❌ Error Getting Stats',
            error: error.message 
        });
    }
});

module.exports = router;