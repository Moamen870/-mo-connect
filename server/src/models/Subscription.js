const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: String,
        enum: ['free_trial', 'basic', 'pro'],
        default: 'free_trial'
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    },
    price: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 يوم
    },
    stripeCustomerId: {
        type: String,
        default: ''
    },
    stripeSubscriptionId: {
        type: String,
        default: ''
    }
});

// التحقق من انتهاء الاشتراك
SubscriptionSchema.methods.isExpired = function() {
    return new Date() > this.endDate;
};

// جيب اسم الـ Plan
SubscriptionSchema.methods.getPlanName = function() {
    const plans = {
        'free_trial': '🆓 Free Trial - 30 يوم',
        'basic': '💳 Basic - \$19/شهر',
        'pro': '💎 Pro - \$149/سنة'
    };
    return plans[this.plan];
};

module.exports = mongoose.model('Subscription', SubscriptionSchema);