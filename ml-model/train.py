import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle

print("Loading dataset...")
df = pd.read_csv('dataset.csv')
df.columns = df.columns.str.strip()
df = df.fillna(0)

all_symptoms = []
for col in df.columns[1:]:
    all_symptoms.extend(df[col].unique())
all_symptoms = [s for s in set(all_symptoms) if s != 0]
all_symptoms = sorted([str(s).strip().lower() for s in all_symptoms if str(s).strip()])

def encode_symptoms(row):
    patient_symptoms = [str(s).strip().lower() for s in row[1:] if s != 0]
    return [1 if symptom in patient_symptoms else 0 for symptom in all_symptoms]

print("Preparing training data...")
X = df.apply(encode_symptoms, axis=1).tolist()
y = df['Disease'].str.strip().tolist()

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training Random Forest model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)
with open('symptoms_list.pkl', 'wb') as f:
    pickle.dump(all_symptoms, f)

print("Model saved as model.pkl")
print(f"Total symptoms: {len(all_symptoms)}")
print(f"Total diseases: {len(set(y))}")
print("Training complete!")
