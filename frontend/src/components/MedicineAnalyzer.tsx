'use client'

import { useState } from 'react'
import { Search, Pill, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { analyzeMedicine, MedicineAnalysis } from '@/lib/api'

export default function MedicineAnalyzer() {
  const [medicineName, setMedicineName] = useState('')
  const [dosage, setDosage] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<MedicineAnalysis | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: '',
    conditions: '',
    current_medications: '',
    allergies: ''
  })

  const handleAnalyze = async () => {
    if (!medicineName.trim()) {
      toast.error('Please enter a medicine name')
      return
    }

    setAnalyzing(true)
    try {
      const result = await analyzeMedicine(
        medicineName,
        dosage || undefined,
        {
          age: patientInfo.age ? parseInt(patientInfo.age) : undefined,
          gender: patientInfo.gender || undefined,
          conditions: patientInfo.conditions || undefined,
          current_medications: patientInfo.current_medications || undefined,
          allergies: patientInfo.allergies || undefined
        }
      )
      setAnalysis(result.analysis)
      toast.success('Analysis complete!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections({ ...expandedSections, [section]: !expandedSections[section] })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'common': return 'bg-blue-100 text-blue-800'
      case 'uncommon': return 'bg-yellow-100 text-yellow-800'
      case 'rare': return 'bg-orange-100 text-orange-800'
      case 'serious': return 'bg-red-100 text-red-800'
      case 'minor': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-orange-100 text-orange-800'
      case 'major': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const commonMedicines = [
    'Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Metformin', 'Omeprazole',
    'Atorvastatin', 'Lisinopril', 'Aspirin', 'Metoprolol', 'Losartan'
  ]

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="card">
        <h3 className="section-title flex items-center gap-2">
          <Pill className="w-5 h-5 text-medical-primary" />
          Analyze Medicine
        </h3>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter medicine name..."
                className="input-field"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
            <input
              type="text"
              placeholder="Dosage (optional)"
              className="input-field w-32"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
          </div>

          {/* Quick Select */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Common medicines:</p>
            <div className="flex flex-wrap gap-2">
              {commonMedicines.map((med) => (
                <button
                  key={med}
                  onClick={() => setMedicineName(med)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                >
                  {med}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Age (optional)"
              className="input-field"
              value={patientInfo.age}
              onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
            />
            <select
              className="input-field"
              value={patientInfo.gender}
              onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
            >
              <option value="">Gender (optional)</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              type="text"
              placeholder="Known conditions"
              className="input-field"
              value={patientInfo.conditions}
              onChange={(e) => setPatientInfo({ ...patientInfo, conditions: e.target.value })}
            />
            <input
              type="text"
              placeholder="Current medications"
              className="input-field"
              value={patientInfo.current_medications}
              onChange={(e) => setPatientInfo({ ...patientInfo, current_medications: e.target.value })}
            />
            <input
              type="text"
              placeholder="Allergies"
              className="input-field"
              value={patientInfo.allergies}
              onChange={(e) => setPatientInfo({ ...patientInfo, allergies: e.target.value })}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!medicineName.trim() || analyzing}
            className="btn-primary w-full"
          >
            {analyzing ? (
              <span className="flex items-center justify-center gap-2">
                <Search className="w-5 h-5 animate-pulse" />
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Analyze Medicine
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Medicine Overview */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{analysis.medicine.name}</h3>
                <p className="text-gray-500">{analysis.medicine.generic_name}</p>
              </div>
              {analysis.medicine.controlled_substance !== 'No' && (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  {analysis.medicine.controlled_substance}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {analysis.medicine.brand_names.map((brand, i) => (
                <span key={i} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {brand}
                </span>
              ))}
            </div>

            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <span className="text-xs text-medical-primary font-medium">Drug Class</span>
              <p className="font-medium">{analysis.medicine.drug_class}</p>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Primary Uses</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {analysis.overview.primary_uses.map((use, i) => (
                    <li key={i}>• {use}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Forms Available</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.overview.forms_available.map((form, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      {form}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-1">How it works</h4>
              <p className="text-gray-600">{analysis.overview.how_it_works}</p>
            </div>
          </div>

          {/* Pros and Cons */}
          <div className="card">
            <h3 className="section-title">Benefits & Drawbacks</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Benefits
                </h4>
                <div className="space-y-3">
                  {analysis.benefits_and_drawbacks.pros.map((pro, i) => (
                    <div key={i} className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{pro.benefit}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          pro.evidence === 'Strong' ? 'bg-green-200 text-green-800' :
                          pro.evidence === 'Moderate' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {pro.evidence} evidence
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{pro.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Drawbacks
                </h4>
                <div className="space-y-3">
                  {analysis.benefits_and_drawbacks.cons.map((con, i) => (
                    <div key={i} className="bg-red-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{con.risk}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(con.severity)}`}>
                          {con.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{con.likelihood} likelihood</p>
                      <p className="text-sm text-gray-600 mt-1"><strong>Mitigation:</strong> {con.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Side Effects */}
          <div className="card">
            <h3 className="section-title">Side Effects</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Common (affecting >1%)</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.side_effects.common.map((se, i) => (
                    <span key={i} className="bg-white text-gray-700 text-xs px-2 py-1 rounded">
                      {se}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Uncommon (0.1-1%)</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.side_effects.uncommon.map((se, i) => (
                    <span key={i} className="bg-white text-gray-700 text-xs px-2 py-1 rounded">
                      {se}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Serious (Seek Help)</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.side_effects.rare_but_serious.map((se, i) => (
                    <span key={i} className="bg-white text-red-700 text-xs px-2 py-1 rounded border border-red-200">
                      {se}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Safety Information */}
          <div className="card">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('safety')}
            >
              <h3 className="section-title">Safety Information</h3>
              {expandedSections['safety'] ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections['safety'] && (
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Contraindications (Who should NOT take this)</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {analysis.safety_information.contraindications.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500">Pregnancy</span>
                    <p className="font-medium">{analysis.safety_information.pregnancy_category}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500">Breastfeeding</span>
                    <p className="font-medium">{analysis.safety_information.breastfeeding}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500">Age Restrictions</span>
                    <p className="font-medium">{analysis.safety_information.age_restrictions}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Precautions</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {analysis.safety_information.precautions.map((p, i) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Interactions */}
          <div className="card">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('interactions')}
            >
              <h3 className="section-title">Interactions</h3>
              {expandedSections['interactions'] ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections['interactions'] && (
              <div className="mt-4 space-y-4">
                {analysis.interactions.drug_interactions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Drug Interactions</h4>
                    <div className="space-y-2">
                      {analysis.interactions.drug_interactions.map((int, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{int.drug}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(int.severity)}`}>
                              {int.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{int.effect}</p>
                          <p className="text-sm text-medical-primary mt-1"><strong>Action:</strong> {int.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">Food Interactions</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {analysis.interactions.food_interactions.map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">Alcohol Interaction</h4>
                    <p className="text-sm text-gray-600">{analysis.interactions.alcohol}</p>
                  </div>
                </div>

                {analysis.interactions.supplement_interactions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Supplement Interactions</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.interactions.supplement_interactions.map((s, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Practical Guidance */}
          <div className="card">
            <h3 className="section-title">How to Take</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-xs text-gray-500">Best Time</span>
                <p className="font-medium">{analysis.practical_guidance.best_time_to_take}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-xs text-gray-500">With Food</span>
                <p className="font-medium">{analysis.practical_guidance.with_or_without_food}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-xs text-gray-500">Storage</span>
                <p className="font-medium">{analysis.practical_guidance.storage}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-medical-primary mb-1">Missed Dose</h4>
              <p className="text-sm">{analysis.practical_guidance.missed_dose}</p>
            </div>
          </div>

          {/* Patient Reviews */}
          <div className="card">
            <h3 className="section-title">Patient Feedback Summary</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-medical-primary">
                  {analysis.patient_reviews_summary.average_rating}
                </div>
                <p className="text-gray-500 mt-1">Average Rating (out of 10)</p>
                <p className="text-sm text-gray-400 mt-1">{analysis.patient_reviews_summary.satisfaction_rate} satisfaction</p>
              </div>
              <div>
                <h4 className="font-medium text-green-700 mb-2">Common Praise</h4>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  {analysis.patient_reviews_summary.common_positive_feedback.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <h4 className="font-medium text-orange-700 mb-2">Common Concerns</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {analysis.patient_reviews_summary.common_complaints.map((c, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Doctor Recommendation */}
          <div className="card bg-gray-50">
            <h3 className="section-title">Doctor's Perspective</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">When This Medicine is Typically Prescribed</h4>
                <p className="text-gray-600">{analysis.doctor_recommendation.when_to_consider}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Alternative Treatments</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.doctor_recommendation.alternatives.map((alt, i) => (
                    <span key={i} className="bg-white border px-3 py-1 rounded-full text-sm">
                      {alt}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">Questions to Ask Your Doctor</h4>
                <ul className="text-sm space-y-1">
                  {analysis.doctor_recommendation.questions_to_ask_doctor.map((q, i) => (
                    <li key={i}>• {q}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center italic">
            {analysis.disclaimer}
          </p>
        </div>
      )}
    </div>
  )
}