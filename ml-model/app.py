from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route('/')
def health():
    return 'OK', 200

print("Loading ML model...")
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)
with open('symptoms_list.pkl', 'rb') as f:
    all_symptoms = pickle.load(f)

descriptions = {}
precautions = {}
try:
    desc_df = pd.read_csv('symptom_Description.csv')
    desc_df.columns = desc_df.columns.str.strip()
    for _, row in desc_df.iterrows():
        descriptions[row['Disease'].strip()] = row['Description'].strip()
except Exception as e:
    print(f"Descriptions not loaded: {e}")

try:
    prec_df = pd.read_csv('symptom_precaution.csv')
    prec_df.columns = prec_df.columns.str.strip()
    for _, row in prec_df.iterrows():
        precs = [str(row[col]).strip() for col in prec_df.columns[1:] if str(row[col]).strip() != 'nan']
        precautions[row['Disease'].strip()] = precs
except Exception as e:
    print(f"Precautions not loaded: {e}")

print(f"Model loaded! {len(all_symptoms)} symptoms, {len(model.classes_)} diseases")

def match_symptoms(user_input):
    user_text = user_input.lower().strip()
    user_text_underscore = user_text.replace(' ', '_')
    matched = []

    for symptom in all_symptoms:
        symptom_underscore = symptom.lower().strip()
        symptom_spaces = symptom.lower().replace('_', ' ').strip()

        if symptom_underscore in user_text_underscore:
            matched.append(symptom)
            continue

        if symptom_spaces in user_text:
            matched.append(symptom)
            continue

        symptom_words = symptom_spaces.split()
        if len(symptom_words) == 1:
            if symptom_words[0] in user_text.split():
                matched.append(symptom)
                continue

    # If nothing matched try partial word matching
    if not matched:
        user_words = user_text.split()
        for word in user_words:
            if len(word) > 3:
                for symptom in all_symptoms:
                    symptom_clean = symptom.replace('_', ' ')
                    if word in symptom_clean and symptom not in matched:
                        matched.append(symptom)

    return matched

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ML API running", "diseases": len(model.classes_), "symptoms": len(all_symptoms)})

@app.route('/symptoms', methods=['GET'])
def get_symptoms():
    return jsonify({"symptoms": all_symptoms})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        user_input = data.get('symptomsText', '')
        user_symptoms_list = data.get('symptoms', [])
        combined_input = user_input + ' ' + ' '.join(user_symptoms_list)

        print(f"User input: {combined_input}")

        matched = match_symptoms(combined_input)
        print(f"Matched symptoms: {matched}")

        if not matched:
            return jsonify({
                "error": "No matching symptoms found",
                "tip": "Try: fever, cough, headache, fatigue, nausea, vomiting"
            }), 404

        input_vector = [1 if symptom in matched else 0 for symptom in all_symptoms]

        prediction = model.predict([input_vector])[0]
        probabilities = model.predict_proba([input_vector])[0]
        confidence = round(float(max(probabilities)) * 100, 2)

        top5_idx = np.argsort(probabilities)[-5:][::-1]
        top5 = []
        for i in top5_idx:
            disease = model.classes_[i]
            prob = round(float(probabilities[i]) * 100, 2)
            if prob > 0:
                top5.append({
                    "disease": disease,
                    "confidence": prob,
                    "description": descriptions.get(disease, ""),
                    "precautions": precautions.get(disease, [])
                })

        print(f"Prediction: {prediction} ({confidence}%)")

        return jsonify({
            "prediction": prediction,
            "confidence": confidence,
            "description": descriptions.get(prediction, ""),
            "precautions": precautions.get(prediction, []),
            "top5": top5,
            "symptoms_matched": matched,
            "symptoms_unmatched": []
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask ML API on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=False)