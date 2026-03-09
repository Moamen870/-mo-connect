'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const SERVER_URL = 'http://localhost:5000';

interface Plan {
    id: string;
    name: string;
    price: number;
    duration: string;
    features: string[];
}

export default function Subscription() {
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [currentPlan, setCurrentPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [plansRes, currentRes] = await Promise.all([
                axios.get(`${SERVER_URL}/api/subscription/plans`),
                axios.get(`${SERVER_URL}/api/subscription/current`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setPlans(plansRes.data.data);
            setCurrentPlan(currentRes.data.data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const handleUpgrade = async (planId: string) => {
        setUpgrading(planId);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${SERVER_URL}/api/subscription/upgrade`,
                { plan: planId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                await fetchData();
                alert(response.data.message);
            }
        } catch (error: any) {
            alert(error.response?.data?.message || '❌ خطأ في الترقية');
        } finally {
            setUpgrading('');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <p className="text-white text-xl">⏳ جاري التحميل...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-blue-400">🚀 MO Connect</h1>
                <p className="text-gray-400 mt-2 text-xl">اختار الباقة المناسبة ليك</p>

                {/* Current Plan */}
                {currentPlan && (
                    <div className="bg-gray-800 inline-block px-6 py-3 rounded-full mt-4">
                        <span className="text-gray-400">الباقة الحالية: </span>
                        <span className="text-green-400 font-bold">{currentPlan.planName}</span>
                        <span className="text-gray-400 mr-2">
                            | باقي {currentPlan.daysLeft} يوم
                        </span>
                    </div>
                )}
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`rounded-2xl p-6 ${
                            plan.id === 'pro'
                                ? 'bg-blue-900 border-2 border-blue-400'
                                : 'bg-gray-800'
                        }`}
                    >
                        {/* Plan Badge */}
                        {plan.id === 'pro' && (
                            <div className="text-center mb-4">
                                <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
                                    ⭐ الأكثر شيوعاً
                                </span>
                            </div>
                        )}

                        {/* Plan Name */}
                        <h2 className="text-2xl font-bold text-center mb-2">{plan.name}</h2>

                        {/* Price */}
                        <div className="text-center mb-6">
                            <span className="text-4xl font-bold text-blue-400">
                                ${plan.price}
                            </span>
                            <span className="text-gray-400">/{plan.duration}</span>
                        </div>

                        {/* Features */}
                        <ul className="space-y-2 mb-6">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="text-gray-300">
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* Button */}
                        {plan.id === 'free_trial' ? (
                            <button
                                onClick={() => router.push('/')}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg font-semibold transition-colors"
                            >
                                {currentPlan?.plan === 'free_trial' ? '✅ باقتك الحالية' : 'ابدأ مجاناً'}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={upgrading === plan.id || currentPlan?.plan === plan.id}
                                className={`w-full p-3 rounded-lg font-semibold transition-colors ${
                                    currentPlan?.plan === plan.id
                                        ? 'bg-green-700 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                {upgrading === plan.id
                                    ? '⏳ جاري الترقية...'
                                    : currentPlan?.plan === plan.id
                                    ? '✅ باقتك الحالية'
                                    : `🚀 اشترك دلوقتي`}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Back to Dashboard */}
            <div className="text-center mt-8">
                <button
                    onClick={() => router.push('/')}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    ← رجوع للـ Dashboard
                </button>
            </div>
        </div>
    );
}