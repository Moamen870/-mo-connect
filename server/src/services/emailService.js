require('dotenv').config();
const nodemailer = require('nodemailer');

// إعداد الـ Transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// إيميل لو النت قطع
const sendDisconnectionAlert = async (userEmail, userName, latency) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: userEmail,
            subject: '🔴 تحذير - انقطاع الإنترنت',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #1a1a2e; padding: 30px; border-radius: 10px;">
                        <h1 style="color: #e94560; text-align: center;">
                            🔴 تحذير انقطاع الإنترنت
                        </h1>
                        <div style="background: #16213e; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="color: #ffffff; font-size: 16px;">عزيزي ${userName},</p>
                            <p style="color: #a8a8b3; font-size: 14px;">
                                تم رصد انقطاع في اتصال الإنترنت الخاص بك
                            </p>
                            <div style="background: #0f3460; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <p style="color: #e94560; margin: 0;">❌ حالة الاتصال: منقطع</p>
                                <p style="color: #a8a8b3; margin: 10px 0 0 0;">
                                    ⏰ وقت الانقطاع: ${new Date().toLocaleString('ar-EG')}
                                </p>
                            </div>
                            <p style="color: #a8a8b3; font-size: 14px;">
                                ✅ تم التحويل تلقائياً للاتصال الاحتياطي
                            </p>
                        </div>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="http://localhost:3000" 
                               style="background: #e94560; color: white; padding: 12px 24px; 
                                      border-radius: 6px; text-decoration: none; font-weight: bold;">
                                عرض التفاصيل في Dashboard
                            </a>
                        </div>
                        <p style="color: #4a4a6a; text-align: center; font-size: 12px; margin-top: 20px;">
                            MO Connect - مراقبة شبكات الإنترنت
                        </p>
                    </div>
                </div>
            `
        });
        console.log(`✅ تم إرسال تحذير الانقطاع إلى ${userEmail}`);
        return true;
    } catch (error) {
        console.log(`❌ خطأ في إرسال الإيميل: ${error.message}`);
        return false;
    }
};

// إيميل لو النت رجع
const sendReconnectionAlert = async (userEmail, userName) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: userEmail,
            subject: '🟢 الإنترنت رجع',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #1a1a2e; padding: 30px; border-radius: 10px;">
                        <h1 style="color: #4ecca3; text-align: center;">
                            🟢 الإنترنت رجع
                        </h1>
                        <div style="background: #16213e; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="color: #ffffff; font-size: 16px;">عزيزي ${userName},</p>
                            <div style="background: #0f3460; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <p style="color: #4ecca3; margin: 0;">✅ حالة الاتصال: متصل</p>
                                <p style="color: #a8a8b3; margin: 10px 0 0 0;">
                                    ⏰ وقت الرجوع: ${new Date().toLocaleString('ar-EG')}
                                </p>
                            </div>
                            <p style="color: #a8a8b3; font-size: 14px;">
                                ✅ تم الرجوع للاتصال الأساسي تلقائياً
                            </p>
                        </div>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="http://localhost:3000" 
                               style="background: #4ecca3; color: #1a1a2e; padding: 12px 24px; 
                                      border-radius: 6px; text-decoration: none; font-weight: bold;">
                                عرض التفاصيل في Dashboard
                            </a>
                        </div>
                        <p style="color: #4a4a6a; text-align: center; font-size: 12px; margin-top: 20px;">
                            MO Connect - مراقبة شبكات الإنترنت
                        </p>
                    </div>
                </div>
            `
        });
        console.log(`✅ تم إرسال إشعار الرجوع إلى ${userEmail}`);
        return true;
    } catch (error) {
        console.log(`❌ خطأ في إرسال الإيميل: ${error.message}`);
        return false;
    }
};

module.exports = { sendDisconnectionAlert, sendReconnectionAlert };