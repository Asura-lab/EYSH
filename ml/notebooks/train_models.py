"""
EYSH - ML Model Training Script
Элсэлтийн ерөнхий шалгалтын бэлтгэл системийн ML моделүүд
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.metrics import classification_report, mean_squared_error
import joblib
import json
import os

# Create directories
os.makedirs('../trained_models', exist_ok=True)

print("=" * 60)
print("EYSH ML Model Training")
print("=" * 60)

# ============================================================
# 1. LEVEL PREDICTOR MODEL
# Сурагчийн түвшинг тодорхойлох (1-10)
# ============================================================
print("\n1. Training Level Predictor Model...")

# Synthetic training data (бодит өгөгдөл цугларах хүртэл)
np.random.seed(42)
n_samples = 5000

# Features
level_data = {
    'correct_ratio': np.random.uniform(0.1, 1.0, n_samples),
    'avg_time_per_question': np.random.uniform(20, 180, n_samples),
    'hard_correct_ratio': np.random.uniform(0, 1, n_samples),
    'algebra_score': np.random.uniform(0, 100, n_samples),
    'geometry_score': np.random.uniform(0, 100, n_samples),
    'trigonometry_score': np.random.uniform(0, 100, n_samples),
    'calculus_score': np.random.uniform(0, 100, n_samples),
    'probability_score': np.random.uniform(0, 100, n_samples),
}

df_level = pd.DataFrame(level_data)

# Calculate weighted score for level
weighted = (
    df_level['correct_ratio'] * 30 +
    df_level['hard_correct_ratio'] * 20 +
    (1 - df_level['avg_time_per_question'] / 200) * 10 +
    (df_level['algebra_score'] + df_level['geometry_score'] + 
     df_level['trigonometry_score'] + df_level['calculus_score'] + 
     df_level['probability_score']) / 5 * 0.4
)
weighted = np.clip(weighted + np.random.normal(0, 5, n_samples), 0, 100)

# Convert to levels 1-10
df_level['level'] = pd.cut(weighted, bins=10, labels=range(1, 11)).astype(int)

# Train
X_level = df_level.drop('level', axis=1)
y_level = df_level['level']

X_train, X_test, y_train, y_test = train_test_split(
    X_level, y_level, test_size=0.2, random_state=42, stratify=y_level
)

# Scale
level_scaler = StandardScaler()
X_train_scaled = level_scaler.fit_transform(X_train)
X_test_scaled = level_scaler.transform(X_test)

# Model
level_model = RandomForestClassifier(
    n_estimators=100, 
    max_depth=10,
    random_state=42,
    n_jobs=-1
)
level_model.fit(X_train_scaled, y_train)

# Evaluate
train_acc = level_model.score(X_train_scaled, y_train)
test_acc = level_model.score(X_test_scaled, y_test)
print(f"   Train Accuracy: {train_acc:.4f}")
print(f"   Test Accuracy: {test_acc:.4f}")

# Save
joblib.dump(level_model, '../trained_models/level_predictor.joblib')
joblib.dump(level_scaler, '../trained_models/level_scaler.joblib')
print("   Saved: level_predictor.joblib, level_scaler.joblib")

# ============================================================
# 2. WEAKNESS DETECTOR MODEL
# Сул талуудыг илрүүлэх
# ============================================================
print("\n2. Training Weakness Detector Model...")

# Multi-label classification for weakness detection
np.random.seed(43)
n_samples = 5000
topics = ['algebra', 'geometry', 'trigonometry', 'calculus', 'probability', 'sequences', 'functions', 'vectors']

weakness_data = {
    f'{topic}_attempts': np.random.randint(1, 20, n_samples) for topic in topics
}
for topic in topics:
    weakness_data[f'{topic}_correct'] = np.random.randint(0, weakness_data[f'{topic}_attempts'] + 1)
    weakness_data[f'{topic}_avg_time'] = np.random.uniform(30, 180, n_samples)

df_weakness = pd.DataFrame(weakness_data)

# Calculate weakness scores (0-1, lower = weaker)
for topic in topics:
    df_weakness[f'{topic}_score'] = df_weakness[f'{topic}_correct'] / df_weakness[f'{topic}_attempts']
    # Add time penalty (faster = better)
    df_weakness[f'{topic}_score'] -= (df_weakness[f'{topic}_avg_time'] / 300) * 0.2
    df_weakness[f'{topic}_score'] = df_weakness[f'{topic}_score'].clip(0, 1)

# Features
feature_cols = [f'{topic}_score' for topic in topics]
X_weakness = df_weakness[feature_cols]

# Find weakest topic for each sample
weakness_scores = X_weakness.values
weakest_indices = np.argmin(weakness_scores, axis=1)

# Train a model to predict which topic is weakest
weakness_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=8,
    random_state=42,
    n_jobs=-1
)
weakness_model.fit(X_weakness, weakest_indices)

print(f"   Topics: {topics}")
print(f"   Accuracy: {weakness_model.score(X_weakness, weakest_indices):.4f}")

# Save
joblib.dump(weakness_model, '../trained_models/weakness_detector.joblib')
joblib.dump(topics, '../trained_models/topic_names.joblib')
print("   Saved: weakness_detector.joblib, topic_names.joblib")

# ============================================================
# 3. ROADMAP GENERATOR MODEL
# Хувийн сургалтын төлөвлөгөө үүсгэх
# ============================================================
print("\n3. Training Roadmap Generator Model...")

# Regression model to predict optimal study hours per topic
np.random.seed(44)
n_samples = 5000

roadmap_data = {
    'current_level': np.random.randint(1, 11, n_samples),
    'target_level': np.random.randint(5, 11, n_samples),
    'weeks_available': np.random.randint(4, 24, n_samples),
}

# Add topic scores
for topic in topics:
    roadmap_data[f'{topic}_score'] = np.random.uniform(0, 1, n_samples)

df_roadmap = pd.DataFrame(roadmap_data)
df_roadmap['target_level'] = df_roadmap[['current_level', 'target_level']].max(axis=1)

# Calculate recommended hours per week
level_gap = df_roadmap['target_level'] - df_roadmap['current_level']
df_roadmap['recommended_hours'] = (level_gap * 3 + 5).clip(5, 40)
df_roadmap['recommended_hours'] += np.random.normal(0, 2, n_samples)
df_roadmap['recommended_hours'] = df_roadmap['recommended_hours'].clip(5, 40)

# Features and target
X_roadmap = df_roadmap.drop('recommended_hours', axis=1)
y_roadmap = df_roadmap['recommended_hours']

X_train, X_test, y_train, y_test = train_test_split(
    X_roadmap, y_roadmap, test_size=0.2, random_state=42
)

# Scale
roadmap_scaler = StandardScaler()
X_train_scaled = roadmap_scaler.fit_transform(X_train)
X_test_scaled = roadmap_scaler.transform(X_test)

# Model
roadmap_model = GradientBoostingRegressor(
    n_estimators=100,
    max_depth=5,
    random_state=42
)
roadmap_model.fit(X_train_scaled, y_train)

# Evaluate
train_pred = roadmap_model.predict(X_train_scaled)
test_pred = roadmap_model.predict(X_test_scaled)
print(f"   Train RMSE: {np.sqrt(mean_squared_error(y_train, train_pred)):.4f}")
print(f"   Test RMSE: {np.sqrt(mean_squared_error(y_test, test_pred)):.4f}")

# Save
joblib.dump(roadmap_model, '../trained_models/roadmap_generator.joblib')
joblib.dump(roadmap_scaler, '../trained_models/roadmap_scaler.joblib')
print("   Saved: roadmap_generator.joblib, roadmap_scaler.joblib")

# ============================================================
# 4. Save Model Metadata
# ============================================================
print("\n4. Saving model metadata...")

metadata = {
    'level_predictor': {
        'features': list(X_level.columns),
        'output': 'level (1-10)',
        'model_type': 'RandomForestClassifier',
        'accuracy': float(test_acc)
    },
    'weakness_detector': {
        'features': feature_cols,
        'output': 'weakest_topic_index',
        'topics': topics,
        'model_type': 'RandomForestClassifier'
    },
    'roadmap_generator': {
        'features': list(X_roadmap.columns),
        'output': 'recommended_hours_per_week',
        'model_type': 'GradientBoostingRegressor'
    }
}

with open('../trained_models/model_metadata.json', 'w', encoding='utf-8') as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)

print("   Saved: model_metadata.json")

print("\n" + "=" * 60)
print("Training Complete!")
print("=" * 60)
print("\nModels saved in: trained_models/")
print("  - level_predictor.joblib")
print("  - level_scaler.joblib")
print("  - weakness_detector.joblib")
print("  - topic_names.joblib")
print("  - roadmap_generator.joblib")
print("  - roadmap_scaler.joblib")
print("  - model_metadata.json")
