const express = require('express');
const router = express.Router();
const Reading = require('../models/Reading');

// بيستقبل البيانات من الـ Agent
router.post('/add', async (req, res) => {
    try {
        const reading = new Reading(req.body);
        await reading.save();
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