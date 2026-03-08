import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pymongo
import pickle
from datetime import datetime

# الاتصال بالـ Database
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["mo-connect"]
collection = db["readings"]

def get_training_data():
    """بيجيب البيانات من الـ Database"""
    print("📊 جاري جلب البيانات...")
    readings = list(collection.find({}, {
        'latency_ms': 1,
        'is_connected': 1,
        'failover': 1,
        '_id': 0
    }))
    
    if len(readings) < 10:
        print("⚠️ البيانات مش كفاية للتدريب - هنعمل بيانات تجريبية")
        return generate_sample_data()
    
    return readings

def generate_sample_data():
    """بيعمل بيانات تجريبية للتدريب"""
    np.random.seed(42)
    n_samples = 1000
    
    data = []
    for i in range(n_samples):
        if np.random.random() > 0.2:
            latency = np.random.normal(60, 15)
            failure_count = np.random.randint(0, 2)
            is_connected = True
        else:
            latency = np.random.normal(200, 50)
            failure_count = np.random.randint(2, 5)
            is_connected = False
            
        data.append({
            'latency_ms': max(0, latency),
            'failure_count': failure_count,
            'is_connected': is_connected
        })
    
    return data

def prepare_features(data):
    """بيجهز البيانات للتدريب"""
    df = pd.DataFrame(data)
    
    if 'failover' in df.columns:
        df['failure_count'] = df['failover'].apply(
            lambda x: x.get('failure_count', 0) if isinstance(x, dict) else 0
        )
    elif 'failure_count' not in df.columns:
        df['failure_count'] = 0
    
    X = df[['latency_ms', 'failure_count']].fillna(0)
    
    y = (~df['is_connected'].astype(bool)).astype(int)
    if len(y.unique()) == 1:
        y.iloc[0] = 1
    
    return X, y

def train_model():
    """بيدرب الـ AI Model"""
    print("🤖 جاري تدريب الـ AI Model...")
    
    data = get_training_data()
    
    X, y = prepare_features(data)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"✅ دقة الـ Model: {accuracy * 100:.2f}%")
    
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    print("✅ تم حفظ الـ Model في model.pkl")
    return model, accuracy

if __name__ == "__main__":
    train_model()