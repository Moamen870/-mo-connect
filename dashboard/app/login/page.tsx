'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SERVER_URL = 'http://localhost:5000';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${SERVER_URL}/api/auth/login`, formData);
            
            if (response.data.success) {
                // حفظ الـ Token
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // روح للـ Dashboard
                router.push('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || '❌ خطأ في تسجيل الدخول');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-400">🚀 MO Connect</h1>
                    <p className="text-gray-400 mt-2">تسجيل الدخول</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-900 text-red-200 p-3 rounded-lg mb-4 text-center">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">الإيميل</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="example@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">الباسورد</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition-colors"
                    >
                        {loading ? '⏳ جاري تسجيل الدخول...' : '🔑 تسجيل الدخول'}
                    </button>
                </form>

                {/* Register Link */}
                <p className="text-center text-gray-400 mt-4">
                    مش عندك حساب؟{' '}
                    <Link href="/register" className="text-blue-400 hover:underline">
                        سجل دلوقتي مجاناً
                    </Link>
                </p>
            </div>
        </div>
    );
}