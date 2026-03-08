import requests
import psutil
import ping3
import schedule
import time
import json
from datetime import datetime
from failover import handle_failover, get_failover_status

# إعدادات الـ Agent
SERVER_URL = "http://localhost:5000"
CHECK_INTERVAL = 5
PING_HOST = "8.8.8.8"

def check_connection():
    """بيتحقق من الاتصال بالنت"""
    try:
        response_time = ping3.ping(PING_HOST, timeout=3)
        if response_time is None:
            return False, 0
        return True, round(response_time * 1000, 2)
    except Exception:
        return False, 0

def get_network_stats():
    """بيجيب إحصائيات الشبكة"""
    stats = psutil.net_io_counters()
    return {
        "bytes_sent": stats.bytes_sent,
        "bytes_recv": stats.bytes_recv,
    }

def collect_data():
    """بيجمع كل البيانات"""
    is_connected, latency = check_connection()
    
    # تشغيل الـ Failover
    handle_failover(is_connected)
    
    # جيب حالة الـ Failover
    failover_status = get_failover_status()
    
    data = {
        "timestamp": datetime.now().isoformat(),
        "is_connected": is_connected,
        "latency_ms": latency,
        "network_stats": get_network_stats(),
        "failover": failover_status
    }
    
    print(f"[{data['timestamp']}] Connected: {is_connected} | Latency: {latency}ms | Backup: {failover_status['is_using_backup']}")
    return data

def run():
    """بيشغل الـ Agent"""
    print("🚀 MO Connect Agent Started...")
    collect_data()

# تشغيل المراقبة كل 5 ثواني
schedule.every(CHECK_INTERVAL).seconds.do(collect_data)

if __name__ == "__main__":
    run()
    while True:
        schedule.run_pending()
        time.sleep(1)