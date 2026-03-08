import numpy as np
import pandas as pd
import pickle
import requests
from datetime import datetime

def load_model():
    """بيحمل الـ AI Model"""
    try:
        with open('model.pkl', 'rb') as f:
            model = pickle.load(f)
        print("✅ تم تحميل الـ AI Model")
        return model
    except Exception as e:
        print(f"❌ خطأ في تحميل الـ Model: {e}")
        return None

def predict_connection(model, latency_ms, failure_count):
    """بيتوقع لو النت هيقطع"""
    try:
        features = pd.DataFrame(
            [[latency_ms, failure_count]], 
            columns=['latency_ms', 'failure_count']
        )
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0]
        
        result = {
            "timestamp": datetime.now().isoformat(),
            "latency_ms": latency_ms,
            "failure_count": failure_count,
            "will_disconnect": bool(prediction),
            "disconnect_probability": round(float(probability[1]) * 100, 2),
            "status": "🔴 خطر - النت هيقطع!" if prediction else "🟢 اتصال مستقر"
        }
        
        return result
    except Exception as e:
        print(f"❌ خطأ في التوقع: {e}")
        return None

def get_latest_readings():
    """بيجيب آخر البيانات من الـ Server"""
    try:
        response = requests.get(
            "http://localhost:5000/api/readings/latest",
            timeout=5
        )
        data = response.json()
        if data['success'] and len(data['data']) > 0:
            return data['data'][0]
        return None
    except Exception as e:
        print(f"❌ خطأ في جلب البيانات: {e}")
        return None

def run_predictor():
    """بيشغل الـ Predictor"""
    print("🤖 MO Connect AI Predictor Started...")
    
    model = load_model()
    if not model:
        return
    
    reading = get_latest_readings()
    if not reading:
        print("⚠️ مفيش بيانات - هنجرب بيانات تجريبية")
        test_cases = [
            {"latency_ms": 60, "failure_count": 0},
            {"latency_ms": 150, "failure_count": 2},
            {"latency_ms": 300, "failure_count": 4},
        ]
        for case in test_cases:
            result = predict_connection(model, case['latency_ms'], case['failure_count'])
            if result:
                print(f"\n📊 التوقع:")
                print(f"   Latency: {result['latency_ms']}ms")
                print(f"   Failures: {result['failure_count']}")
                print(f"   Status: {result['status']}")
                print(f"   احتمال القطع: {result['disconnect_probability']}%")
        return
    
    latency = reading.get('latency_ms', 0)
    failure_count = reading.get('failover', {}).get('failure_count', 0)
    
    result = predict_connection(model, latency, failure_count)
    if result:
        print(f"\n📊 التوقع بالبيانات الحقيقية:")
        print(f"   Latency: {result['latency_ms']}ms")
        print(f"   Failures: {result['failure_count']}")
        print(f"   Status: {result['status']}")
        print(f"   احتمال القطع: {result['disconnect_probability']}%")

if __name__ == "__main__":
    run_predictor()