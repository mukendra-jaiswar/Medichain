import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../services/api';
import { Brain, Search, ChevronRight, AlertCircle, CheckCircle2, Loader2, Stethoscope, TrendingUp, RotateCcw } from 'lucide-react';

const CONFIDENCE_COLOR = (c) => {
  if (c >= 70) return 'text-emerald-400';
  if (c >= 40) return 'text-amber-400';
  return 'text-red-400';
};

// Symptom categories for organized display
const SYMPTOM_CATEGORIES = {
  'Fever & Chills': [
    'high_fever', 'mild_fever', 'chills', 'shivering', 'sweating',
  ],
  'Head & Neurological': [
    'headache', 'dizziness', 'loss_of_balance', 'unsteadiness',
    'weakness_of_one_body_side', 'altered_sensorium', 'lack_of_concentration',
    'visual_disturbances', 'blurred_and_distorted_vision', 'loss_of_smell',
  ],
  'Respiratory': [
    'cough', 'breathlessness', 'congestion', 'runny_nose', 'continuous_sneezing',
    'phlegm', 'mucoid_sputum', 'rusty_sputum', 'blood_in_sputum',
    'throat_irritation', 'patches_in_throat', 'sinus_pressure',
  ],
  'Digestive & Stomach': [
    'nausea', 'vomiting', 'stomach_pain', 'abdominal_pain', 'belly_pain',
    'indigestion', 'acidity', 'diarrhoea', 'constipation', 'loss_of_appetite',
    'passage_of_gases', 'stomach_bleeding', 'distention_of_abdomen',
    'ulcers_on_tongue', 'swelling_of_stomach',
  ],
  'Skin & Hair': [
    'itching', 'skin_rash', 'nodal_skin_eruptions', 'dischromic_patches',
    'skin_peeling', 'silver_like_dusting', 'blackheads', 'pus_filled_pimples',
    'scurring', 'blister', 'red_sore_around_nose', 'yellow_crust_ooze',
    'yellowish_skin', 'red_spots_over_body', 'redness_of_eyes',
  ],
  'Joints & Muscles': [
    'joint_pain', 'muscle_pain', 'muscle_wasting', 'neck_stiffness',
    'back_pain', 'weakness_in_limbs', 'painful_walking', 'inflammatory_nails',
    'small_dents_in_nails', 'movement_stiffness',
  ],
  'Urinary': [
    'burning_micturition', 'spotting_urination', 'bladder_discomfort',
    'foul_smell_of_urine', 'continuous_feel_of_urine', 'yellow_urine', 'dark_urine',
  ],
  'Energy & Mood': [
    'fatigue', 'lethargy', 'malaise', 'restlessness', 'anxiety', 'depression',
    'irritability', 'mood_swings', 'weight_loss', 'weight_gain',
    'cold_hands_and_feets', 'dehydration',
  ],
  'Eyes & ENT': [
    'watering_from_eyes', 'sunken_eyes', 'pain_behind_the_eyes',
    'yellowing_of_eyes', 'loss_of_balance',
  ],
  'Heart & Blood': [
    'chest_pain', 'fast_heart_rate', 'palpitations', 'prominent_veins_on_calf',
    'swelled_lymph_nodes', 'fluid_overload', 'acute_liver_failure',
  ],
  'Other': [
    'irregular_sugar_level', 'polyuria', 'increased_appetite', 'family_history',
    'history_of_alcohol_consumption', 'abnormal_menstruation', 'internal_itching',
    'bloody_stool', 'pain_in_anal_region', 'irritation_in_anus',
    'pain_during_bowel_movements',
  ],
};

const formatLabel = (id) => id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [openCategories, setOpenCategories] = useState(
    Object.fromEntries(Object.keys(SYMPTOM_CATEGORIES).map(k => [k, true]))
  );

  const toggleSymptom = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCategory = (cat) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const clearAll = () => { setSelected(new Set()); setResult(null); };

  // Filter by search
  const getFilteredSymptoms = (symptoms) => {
    if (!search) return symptoms;
    return symptoms.filter(s => s.replace(/_/g, ' ').toLowerCase().includes(search.toLowerCase()));
  };

  const predict = async () => {
    if (selected.size < 2) return toast.error('Please select at least 2 symptoms');
    setLoading(true); setResult(null);
    try {
      const { data } = await API.post('/symptoms/predict', { symptoms: Array.from(selected) });
      setResult(data);
      toast.success('Analysis complete!');
      // Scroll to result
      setTimeout(() => document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed. Make sure ML service is running.');
    } finally { setLoading(false); }
  };

  const handleFindDoctors = () => {
    navigate(`/doctors?specialization=${encodeURIComponent(result.specialist_type)}`);
  };

  const visibleCategories = Object.entries(SYMPTOM_CATEGORIES).filter(([, symptoms]) =>
    !search || getFilteredSymptoms(symptoms).length > 0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary-600 to-violet-600 rounded-2xl items-center justify-center mb-4 shadow-2xl">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-black text-white mb-3">AI Symptom Checker</h1>
        <p className="text-gray-400 text-lg">Check the symptoms you're experiencing and let our ML model predict the condition</p>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">

        {/* Left column: checkbox list (2/3 width) */}
        <div className="xl:col-span-2 space-y-4">

          {/* Search + counter bar */}
          <div className="glass-card flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                className="input-field pl-11"
                placeholder="Search symptoms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {selected.size > 0 && (
              <button onClick={clearAll}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors flex-shrink-0">
                <RotateCcw className="w-4 h-4" /> Clear all
              </button>
            )}
            <div className="flex-shrink-0 flex items-center gap-2 text-sm font-semibold">
              <span className={`px-3 py-1.5 rounded-xl font-bold ${selected.size > 0 ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 text-gray-500'}`}>
                {selected.size} selected
              </span>
            </div>
          </div>

          {/* Category sections */}
          {visibleCategories.length === 0 ? (
            <div className="glass-card text-center py-10 text-gray-500">
              No symptoms matched "<span className="text-white">{search}</span>"
            </div>
          ) : (
            visibleCategories.map(([category, symptoms]) => {
              const filtered = getFilteredSymptoms(symptoms);
              if (filtered.length === 0) return null;
              const isOpen = openCategories[category];
              const selectedInCat = filtered.filter(s => selected.has(s)).length;

              return (
                <div key={category} className="glass-card p-0 overflow-hidden">
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white">{category}</span>
                      {selectedInCat > 0 && (
                        <span className="badge-primary text-xs">{selectedInCat} selected</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="text-xs">{filtered.length} symptoms</span>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Symptom checkboxes */}
                  {isOpen && (
                    <div className="border-t border-white/10 px-5 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {filtered.map(symptomId => {
                          const isChecked = selected.has(symptomId);
                          return (
                            <label
                              key={symptomId}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group
                                ${isChecked
                                  ? 'bg-primary-500/20 border border-primary-500/40'
                                  : 'hover:bg-white/5 border border-transparent'}`}
                            >
                              {/* Custom checkbox */}
                              <div
                                onClick={() => toggleSymptom(symptomId)}
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150
                                  ${isChecked
                                    ? 'bg-primary-500 border-primary-500'
                                    : 'border-gray-600 group-hover:border-primary-500/60'}`}
                              >
                                {isChecked && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span
                                onClick={() => toggleSymptom(symptomId)}
                                className={`text-sm leading-tight transition-colors select-none
                                  ${isChecked ? 'text-primary-200 font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}
                              >
                                {formatLabel(symptomId)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right column: selected + result (sticky) */}
        <div className="space-y-4">
          {/* Selected symptoms panel */}
          <div className="glass-card sticky top-20">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent-400" />
              Selected Symptoms
            </h2>

            {selected.size === 0 ? (
              <div className="text-center py-6">
                <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No symptoms checked yet</p>
                <p className="text-gray-600 text-xs mt-1">Check at least 2 to analyze</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-4 max-h-48 overflow-y-auto pr-1">
                {Array.from(selected).map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-500/20 text-primary-300 border border-primary-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-all"
                    title="Click to remove"
                  >
                    {formatLabel(s)}
                    <span className="text-xs opacity-60">×</span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={predict}
              disabled={loading || selected.size < 2}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</>
                : <><Brain className="w-5 h-5" />Analyze {selected.size > 0 ? `(${selected.size})` : ''} Symptoms</>
              }
            </button>

            {selected.size < 2 && selected.size > 0 && (
              <p className="text-xs text-amber-400 text-center mt-2">Select {2 - selected.size} more symptom{2 - selected.size > 1 ? 's' : ''}</p>
            )}
          </div>

          {/* Result panel */}
          {result && (
            <div id="result-section" className="space-y-4 animate-slide-up">
              {/* Top prediction */}
              <div className="glass-card border border-primary-500/30 bg-primary-500/5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-primary-400 font-semibold uppercase tracking-wider mb-1">Primary Prediction</p>
                    <h3 className="text-xl font-black text-white leading-tight">{result.predicted_disease}</h3>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-xs text-gray-500 mb-1">Confidence</p>
                    <p className={`text-3xl font-black ${CONFIDENCE_COLOR(result.confidence)}`}>{result.confidence}%</p>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-1000"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 mb-4 p-2 bg-white/5 rounded-xl">
                  <Stethoscope className="w-4 h-4 text-accent-400 flex-shrink-0" />
                  <span className="text-xs text-gray-400">Recommended Specialist</span>
                  <span className="font-semibold text-accent-300 text-sm ml-auto">{result.specialist_type}</span>
                </div>
                <button onClick={handleFindDoctors} className="btn-accent w-full flex items-center justify-center gap-2 py-3">
                  Find {result.specialist_type}s <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Other predictions */}
              {result.top_predictions?.length > 1 && (
                <div className="glass-card">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-primary-400" />Other Possibilities
                  </h4>
                  <div className="space-y-3">
                    {result.top_predictions.slice(1).map((p, i) => (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <span className="text-xs text-gray-300 truncate flex-1">{p.disease}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-16 bg-white/10 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-primary-500/60" style={{ width: `${p.confidence}%` }} />
                          </div>
                          <span className={`text-xs font-bold w-10 text-right ${CONFIDENCE_COLOR(p.confidence)}`}>{p.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-600 text-center px-2">
                ⚠️ AI prediction only. Always consult a qualified doctor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
