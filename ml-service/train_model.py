import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import joblib
import os

# All 132 symptoms
ALL_SYMPTOMS = [
    'itching','skin_rash','nodal_skin_eruptions','continuous_sneezing','shivering','chills',
    'joint_pain','stomach_pain','acidity','ulcers_on_tongue','muscle_wasting','vomiting',
    'burning_micturition','spotting_urination','fatigue','weight_gain','anxiety',
    'cold_hands_and_feets','mood_swings','weight_loss','restlessness','lethargy',
    'patches_in_throat','irregular_sugar_level','cough','high_fever','sunken_eyes',
    'breathlessness','sweating','dehydration','indigestion','headache','yellowish_skin',
    'dark_urine','nausea','loss_of_appetite','pain_behind_the_eyes','back_pain',
    'constipation','abdominal_pain','diarrhoea','mild_fever','yellow_urine',
    'yellowing_of_eyes','acute_liver_failure','fluid_overload','swelling_of_stomach',
    'swelled_lymph_nodes','malaise','blurred_and_distorted_vision','phlegm',
    'throat_irritation','redness_of_eyes','sinus_pressure','runny_nose','congestion',
    'chest_pain','weakness_in_limbs','fast_heart_rate','pain_during_bowel_movements',
    'pain_in_anal_region','bloody_stool','irritation_in_anus','neck_stiffness',
    'spots_fever','loss_of_balance','unsteadiness','weakness_of_one_body_side',
    'loss_of_smell','bladder_discomfort','foul_smell_of_urine','continuous_feel_of_urine',
    'passage_of_gases','internal_itching','toxic_look_(typhos)','depression',
    'irritability','muscle_pain','altered_sensorium','red_spots_over_body','belly_pain',
    'abnormal_menstruation','dischromic_patches','watering_from_eyes','increased_appetite',
    'polyuria','family_history','mucoid_sputum','rusty_sputum','lack_of_concentration',
    'visual_disturbances','receiving_blood_transfusion','receiving_unsterile_injections',
    'coma','stomach_bleeding','distention_of_abdomen','history_of_alcohol_consumption',
    'fluid_overload.1','blood_in_sputum','prominent_veins_on_calf','palpitations',
    'painful_walking','pus_filled_pimples','blackheads','scurring','skin_peeling',
    'silver_like_dusting','small_dents_in_nails','inflammatory_nails','blister',
    'red_sore_around_nose','yellow_crust_ooze','prognosis'
]

# Disease to specialist mapping
DISEASE_SPECIALIST_MAP = {
    'Fungal infection': 'Dermatologist',
    'Allergy': 'General Physician',
    'GERD': 'Gastroenterologist',
    'Chronic cholestasis': 'Gastroenterologist',
    'Drug Reaction': 'General Physician',
    'Peptic ulcer diseae': 'Gastroenterologist',
    'AIDS': 'General Physician',
    'Diabetes': 'Endocrinologist',
    'Gastroenteritis': 'Gastroenterologist',
    'Bronchial Asthma': 'Pulmonologist',
    'Hypertension': 'Cardiologist',
    'Migraine': 'Neurologist',
    'Cervical spondylosis': 'Orthopedist',
    'Paralysis (brain hemorrhage)': 'Neurologist',
    'Jaundice': 'Gastroenterologist',
    'Malaria': 'General Physician',
    'Chicken pox': 'General Physician',
    'Dengue': 'General Physician',
    'Typhoid': 'General Physician',
    'Hepatitis A': 'Gastroenterologist',
    'Hepatitis B': 'Gastroenterologist',
    'Hepatitis C': 'Gastroenterologist',
    'Hepatitis D': 'Gastroenterologist',
    'Hepatitis E': 'Gastroenterologist',
    'Alcoholic hepatitis': 'Gastroenterologist',
    'Tuberculosis': 'Pulmonologist',
    'Common Cold': 'General Physician',
    'Pneumonia': 'Pulmonologist',
    'Dimorphic hemmorhoids(piles)': 'Gastroenterologist',
    'Heart attack': 'Cardiologist',
    'Varicose veins': 'Cardiologist',
    'Hypothyroidism': 'Endocrinologist',
    'Hyperthyroidism': 'Endocrinologist',
    'Hypoglycemia': 'Endocrinologist',
    'Osteoarthritis': 'Orthopedist',
    'Arthritis': 'Orthopedist',
    '(vertigo) Paroymsal  Positional Vertigo': 'Neurologist',
    'Acne': 'Dermatologist',
    'Urinary tract infection': 'General Physician',
    'Psoriasis': 'Dermatologist',
    'Impetigo': 'Dermatologist',
}

def create_synthetic_data():
    """Create a comprehensive synthetic symptom-disease dataset."""
    np.random.seed(42)
    diseases = list(DISEASE_SPECIALIST_MAP.keys())
    
    # Core symptoms per disease
    disease_symptoms = {
        'Fungal infection': ['itching','skin_rash','nodal_skin_eruptions','dischromic_patches'],
        'Allergy': ['continuous_sneezing','shivering','chills','watering_from_eyes','runny_nose'],
        'GERD': ['stomach_pain','acidity','ulcers_on_tongue','vomiting','cough','chest_pain'],
        'Chronic cholestasis': ['itching','vomiting','yellowish_skin','nausea','loss_of_appetite','abdominal_pain'],
        'Drug Reaction': ['itching','skin_rash','stomach_pain','vomiting','burning_micturition'],
        'Peptic ulcer diseae': ['vomiting','indigestion','loss_of_appetite','abdominal_pain','passage_of_gases'],
        'AIDS': ['muscle_wasting','patches_in_throat','high_fever','fatigue','weight_loss'],
        'Diabetes': ['fatigue','weight_loss','restlessness','lethargy','irregular_sugar_level','polyuria'],
        'Gastroenteritis': ['vomiting','sunken_eyes','dehydration','diarrhoea','stomach_pain'],
        'Bronchial Asthma': ['fatigue','cough','high_fever','breathlessness','mucoid_sputum'],
        'Hypertension': ['headache','chest_pain','dizziness','loss_of_balance','lack_of_concentration'],
        'Migraine': ['acidity','indigestion','headache','blurred_and_distorted_vision','nausea'],
        'Cervical spondylosis': ['back_pain','weakness_in_limbs','neck_stiffness','headache'],
        'Paralysis (brain hemorrhage)': ['vomiting','headache','weakness_of_one_body_side','altered_sensorium'],
        'Jaundice': ['itching','vomiting','fatigue','weight_loss','high_fever','yellowish_skin','dark_urine'],
        'Malaria': ['chills','vomiting','high_fever','sweating','headache','nausea','muscle_pain'],
        'Chicken pox': ['itching','skin_rash','fatigue','lethargy','high_fever','headache','loss_of_appetite','blister'],
        'Dengue': ['skin_rash','chills','joint_pain','vomiting','fatigue','high_fever','headache','nausea','loss_of_appetite'],
        'Typhoid': ['chills','vomiting','fatigue','high_fever','headache','nausea','constipation','abdominal_pain'],
        'Hepatitis A': ['joint_pain','vomiting','yellowish_skin','dark_urine','nausea','loss_of_appetite','abdominal_pain'],
        'Hepatitis B': ['fatigue','itching','vomiting','yellowish_skin','dark_urine','abdominal_pain','loss_of_appetite'],
        'Hepatitis C': ['fatigue','yellowish_skin','nausea','loss_of_appetite','family_history'],
        'Hepatitis D': ['joint_pain','vomiting','fatigue','high_fever','yellowish_skin','dark_urine','nausea'],
        'Hepatitis E': ['joint_pain','vomiting','fatigue','high_fever','yellowish_skin','dark_urine','nausea','loss_of_appetite'],
        'Alcoholic hepatitis': ['vomiting','yellowish_skin','abdominal_pain','swelling_of_stomach','history_of_alcohol_consumption'],
        'Tuberculosis': ['chills','vomiting','fatigue','weight_loss','cough','high_fever','breathlessness','sweating','blood_in_sputum'],
        'Common Cold': ['continuous_sneezing','chills','fatigue','cough','headache','runny_nose','congestion','phlegm'],
        'Pneumonia': ['chills','fatigue','cough','high_fever','breathlessness','sweating','chest_pain','rusty_sputum'],
        'Dimorphic hemmorhoids(piles)': ['constipation','pain_in_anal_region','bloody_stool','irritation_in_anus'],
        'Heart attack': ['vomiting','breathlessness','sweating','chest_pain','fast_heart_rate'],
        'Varicose veins': ['fatigue','cramps','painful_walking','swelled_lymph_nodes','prominent_veins_on_calf'],
        'Hypothyroidism': ['fatigue','weight_gain','cold_hands_and_feets','mood_swings','lethargy','depression'],
        'Hyperthyroidism': ['fatigue','mood_swings','weight_loss','restlessness','sweating','fast_heart_rate','irritability'],
        'Hypoglycemia': ['fatigue','vomiting','anxiety','sweating','headache','nausea','blurred_and_distorted_vision','palpitations'],
        'Osteoarthritis': ['joint_pain','neck_stiffness','knee_pain','hip_joint_pain','swelling_joints'],
        'Arthritis': ['muscle_weakness','stiff_neck','swelling_joints','movement_stiffness','painful_walking'],
        '(vertigo) Paroymsal  Positional Vertigo': ['vomiting','headache','nausea','loss_of_balance','unsteadiness'],
        'Acne': ['skin_rash','pus_filled_pimples','blackheads','scurring'],
        'Urinary tract infection': ['burning_micturition','bladder_discomfort','foul_smell_of_urine','continuous_feel_of_urine'],
        'Psoriasis': ['skin_rash','joint_pain','skin_peeling','silver_like_dusting','small_dents_in_nails','inflammatory_nails'],
        'Impetigo': ['skin_rash','high_fever','blister','red_sore_around_nose','yellow_crust_ooze'],
    }
    
    symptoms_cols = [s for s in ALL_SYMPTOMS if s != 'prognosis']
    rows = []
    
    for disease, core_syms in disease_symptoms.items():
        for _ in range(120):  # 120 samples per disease
            row = {s: 0 for s in symptoms_cols}
            # Add core symptoms (always)
            for sym in core_syms:
                if sym in row:
                    row[sym] = 1
            # Add 1-3 random extra symptoms
            extra = np.random.choice(symptoms_cols, size=np.random.randint(1, 4), replace=False)
            for sym in extra:
                row[sym] = 1
            # Randomly drop 1-2 core symptoms (noise)
            drop = np.random.choice(core_syms, size=min(2, len(core_syms)), replace=False)
            for sym in drop:
                if sym in row:
                    row[sym] = 0
            row['prognosis'] = disease
            rows.append(row)
    
    return pd.DataFrame(rows)

def train():
    print("[*] Generating synthetic training data...")
    df = create_synthetic_data()
    
    symptoms_cols = [s for s in ALL_SYMPTOMS if s != 'prognosis']
    X = df[symptoms_cols].values
    y = df['prognosis'].values
    
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)
    
    print(f"[*] Training Random Forest on {len(X_train)} samples...")
    model = RandomForestClassifier(n_estimators=150, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    acc = accuracy_score(y_test, model.predict(X_test))
    print(f"[OK] Accuracy: {acc * 100:.2f}%")
    
    os.makedirs('model', exist_ok=True)
    joblib.dump(model, 'model/rf_model.pkl')
    joblib.dump(le, 'model/label_encoder.pkl')
    joblib.dump(symptoms_cols, 'model/symptoms.pkl')
    
    # Save specialist map
    import json
    with open('model/specialist_map.json', 'w') as f:
        json.dump(DISEASE_SPECIALIST_MAP, f)
    
    print("[OK] Model saved to model/")

if __name__ == '__main__':
    train()
