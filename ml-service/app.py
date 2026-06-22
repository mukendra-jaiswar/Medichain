from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import json
import os
import numpy as np

app = Flask(__name__)
CORS(app)

# Load model artifacts
MODEL_DIR = 'model'
model, label_encoder, symptoms_list, specialist_map = None, None, None, {}

def load_model():
    global model, label_encoder, symptoms_list, specialist_map
    try:
        model = joblib.load(f'{MODEL_DIR}/rf_model.pkl')
        label_encoder = joblib.load(f'{MODEL_DIR}/label_encoder.pkl')
        symptoms_list = joblib.load(f'{MODEL_DIR}/symptoms.pkl')
        with open(f'{MODEL_DIR}/specialist_map.json') as f:
            specialist_map = json.load(f)
        print('[OK] ML model loaded successfully')
    except Exception as e:
        print(f'[WARN] Model not found: {e}. Run train_model.py first.')

load_model()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ML service running 🤖', 'model_loaded': model is not None})

@app.route('/symptoms', methods=['GET'])
def get_symptoms():
    if symptoms_list is None:
        return jsonify({'error': 'Model not loaded'}), 503
    # Format symptom names for display
    formatted = [{'id': s, 'label': s.replace('_', ' ').title()} for s in symptoms_list]
    return jsonify({'symptoms': formatted, 'count': len(formatted)})

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Run train_model.py first.'}), 503

    data = request.get_json()
    symptoms_input = data.get('symptoms', [])

    if not symptoms_input:
        return jsonify({'error': 'No symptoms provided'}), 400

    # Build feature vector
    feature_vector = np.zeros(len(symptoms_list))
    matched = []
    unmatched = []

    for sym in symptoms_input:
        sym_clean = sym.lower().replace(' ', '_').replace('-', '_')
        if sym_clean in symptoms_list:
            idx = symptoms_list.index(sym_clean)
            feature_vector[idx] = 1
            matched.append(sym_clean)
        else:
            unmatched.append(sym)

    if not matched:
        return jsonify({'error': 'None of the provided symptoms were recognized'}), 400

    # Predict
    probabilities = model.predict_proba([feature_vector])[0]
    top_indices = np.argsort(probabilities)[::-1][:3]

    predictions = []
    for idx in top_indices:
        disease = label_encoder.inverse_transform([idx])[0]
        confidence = round(float(probabilities[idx]) * 100, 2)
        if confidence > 0.5:
            predictions.append({
                'disease': disease,
                'confidence': confidence,
                'specialist': specialist_map.get(disease, 'General Physician')
            })

    if not predictions:
        return jsonify({'error': 'Could not predict disease from given symptoms'}), 400

    top = predictions[0]
    return jsonify({
        'predicted_disease': top['disease'],
        'confidence': top['confidence'],
        'specialist_type': top['specialist'],
        'top_predictions': predictions,
        'matched_symptoms': matched,
        'unmatched_symptoms': unmatched
    })

if __name__ == '__main__':
    print('[*] Starting MediChain ML Service on port 5001...')
    app.run(host='0.0.0.0', port=5001, debug=True)
