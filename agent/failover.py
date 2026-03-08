import subprocess
import psutil
import time
from datetime import datetime

# إعدادات الـ Failover
PRIMARY_CONNECTION = "Wi-Fi"        # الاتصال الأساسي
BACKUP_CONNECTION = "Ethernet"      # الاتصال الاحتياطي
FAILURE_THRESHOLD = 3               # عدد المحاولات قبل التحويل

# حالة الاتصال
failure_count = 0
is_using_backup = False

def get_active_connections():
    """بيجيب الاتصالات الشغالة دلوقتي"""
    connections = []
    stats = psutil.net_if_stats()
    for interface, stat in stats.items():
        if stat.isup:
            connections.append(interface)
    return connections

def switch_to_backup():
    """بيحول للاتصال الاحتياطي"""
    global is_using_backup
    print(f"[{datetime.now().isoformat()}] ⚠️ النت قطع! بيحول للاتصال الاحتياطي...")
    is_using_backup = True
    print(f"[{datetime.now().isoformat()}] ✅ تم التحويل للاتصال الاحتياطي")

def switch_to_primary():
    """بيرجع للاتصال الأساسي"""
    global is_using_backup
    print(f"[{datetime.now().isoformat()}] ✅ النت رجع! بيرجع للاتصال الأساسي...")
    is_using_backup = False
    print(f"[{datetime.now().isoformat()}] ✅ تم الرجوع للاتصال الأساسي")

def handle_failover(is_connected):
    """بيتحكم في عملية التحويل"""
    global failure_count, is_using_backup
    
    if not is_connected:
        failure_count += 1
        print(f"[{datetime.now().isoformat()}] ❌ فشل الاتصال - المحاولة {failure_count}/{FAILURE_THRESHOLD}")
        
        if failure_count >= FAILURE_THRESHOLD and not is_using_backup:
            switch_to_backup()
    else:
        if is_using_backup:
            switch_to_primary()
        failure_count = 0

def get_failover_status():
    """بيرجع حالة الـ Failover"""
    return {
        "is_using_backup": is_using_backup,
        "failure_count": failure_count,
        "active_connections": get_active_connections()
    }