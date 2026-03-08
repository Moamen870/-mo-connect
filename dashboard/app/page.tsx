'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SERVER_URL = 'http://localhost:5000';

interface Reading {
  timestamp: string;
  is_connected: boolean;
  latency_ms: number;
  failover: {
    is_using_backup: boolean;
    failure_count: number;
  };
}

interface Stats {
  total: number;
  connected: number;
  disconnected: number;
  uptime_percentage: string;
}

export default function Dashboard() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [readingsRes, statsRes] = await Promise.all([
        axios.get(`${SERVER_URL}/api/readings/latest`),
        axios.get(`${SERVER_URL}/api/readings/stats`)
      ]);
      setReadings(readingsRes.data.data);
      setStats(statsRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const latestReading = readings[0];
  const chartData = readings.slice(0, 20).reverse().map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString(),
    latency: r.latency_ms,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">⏳ جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-400">🚀 MO Connect</h1>
        <p className="text-gray-400">مراقبة شبكات الإنترنت</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Connection Status */}
        <div className={`p-4 rounded-xl ${latestReading?.is_connected ? 'bg-green-800' : 'bg-red-800'}`}>
          <div className="flex items-center gap-2 mb-2">
            {latestReading?.is_connected ? <Wifi size={20} /> : <WifiOff size={20} />}
            <span className="font-semibold">حالة الاتصال</span>
          </div>
          <p className="text-2xl font-bold">
            {latestReading?.is_connected ? '🟢 متصل' : '🔴 منقطع'}
          </p>
        </div>

        {/* Latency */}
        <div className="p-4 rounded-xl bg-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={20} />
            <span className="font-semibold">زمن الاستجابة</span>
          </div>
          <p className="text-2xl font-bold">{latestReading?.latency_ms}ms</p>
        </div>

        {/* Uptime */}
        <div className="p-4 rounded-xl bg-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={20} />
            <span className="font-semibold">وقت التشغيل</span>
          </div>
          <p className="text-2xl font-bold">{stats?.uptime_percentage}%</p>
        </div>

        {/* Failover */}
        <div className={`p-4 rounded-xl ${latestReading?.failover?.is_using_backup ? 'bg-yellow-800' : 'bg-gray-800'}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} />
            <span className="font-semibold">Failover</span>
          </div>
          <p className="text-2xl font-bold">
            {latestReading?.failover?.is_using_backup ? '⚠️ احتياطي' : '✅ أساسي'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">📊 زمن الاستجابة</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
            />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="#60A5FA"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">📈 الإحصائيات</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-gray-400">إجمالي القراءات</p>
            <p className="text-3xl font-bold text-blue-400">{stats?.total}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">متصل</p>
            <p className="text-3xl font-bold text-green-400">{stats?.connected}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">منقطع</p>
            <p className="text-3xl font-bold text-red-400">{stats?.disconnected}</p>
          </div>
        </div>
      </div>
    </div>
  );
}