const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const readingsRouter = require('./routes/readings');

// تحميل الـ Settings
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/readings', readingsRouter);

// Test Route
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 MO Connect Server Running!',
        version: '1.0.0'
    });
});

// الاتصال بالـ Database
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Database Connected!'))
    .catch((err) => console.log('❌ Database Error:', err));

// تشغيل الـ Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 MO Connect Server Started on Port ${PORT}`);
});