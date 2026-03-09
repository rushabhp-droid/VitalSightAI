'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Pill, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { analyzePrescription, PrescriptionAnalysis } from '@/lib/api'

export default function PrescriptionAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<PrescriptionAnalysis | null>(null)
  const [expandedMedicine, setExpandedMedicine] = useState<number | null>(null)

  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: '',
    conditions: '',
    current_medications: '',
    allergies: ''
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please upload a PDF or image file')
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      setFile(selectedFile)
      setAnalysis(null)
      toast.success(`File "${selectedFile.name}" selected`)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1
  })

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setAnalyzing(true)
    try {
      const result = await analyzePrescription(file, {
        age: patientInfo.age ? parseInt(patientInfo.age) : undefined,
        gender: patientInfo.gender || undefined,
        conditions: patientInfo.conditions || undefined,
        current_medications: patientInfo.current_medications || undefined,
        allergies: patientInfo.allergies || undefined
      })
      setAnalysis(result.analysis)
      toast.success('Analysis complete!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'common': return 'bg-blue-100 text-blue-800'
      case 'rare': return 'bg-yellow-100 text-yellow-800'
      case 'serious': return 'bg-red-100 text-red-800'
      case 'minor': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-orange-100 text-orange-800'
      case 'major': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="card">
        <h3 className="section-title flex items-center gap-2">
          <FileText className="w-5 h-5 text-medical-primary" />
          Upload Prescription
        </h3>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-medical-primary bg-blue-50'
              : 'border-gray-300 hover:border-medical-primary hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-medical-primary' : 'text-gray-400'}`} />
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-gray-700">{file.name}</span>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 font-medium">Drag & drop your prescription here</p>
              <p className="text-gray-400 text-sm mt-1">or click to browse</p>
              <p className="text-gray-400 text-xs mt-2">Supports PDF, PNG, JPG (max 10MB)</p>
            </div>
          )}
        </div>

        {/* Patient Info */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          disabled={!file || analyzing}
          className="btn-primary w-full mt-6"
        >
          {analyzing ? (
            <span className="flex items-center justify-center gap-2">
              <Pill className="w-5 h-5 animate-pulse" />
              Analyzing...
            </span>
          ) : (
            'Analyze Prescription'
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Prescription Summary */}
          <div className="card">
            <h3 className="section-title">Prescription Summary</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {analysis.prescription_summary.doctor_name && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">Doctor</span>
                  <p className="font-medium">{analysis.prescription_summary.doctor_name}</p>
                </div>
              )}
              {analysis.prescription_summary.clinic_name && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">Clinic</span>
                  <p className="font-medium">{analysis.prescription_summary.clinic_name}</p>
                </div>
              )}
              {analysis.prescription_summary.date && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">Date</span>
                  <p className="font-medium">{analysis.prescription_summary.date}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500">Total Medicines</span>
                <p className="font-medium">{analysis.prescription_summary.total_medicines}</p>
              </div>
            </div>
            {analysis.prescription_summary.diagnosis && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-xs text-medical-primary font-medium">Likely Diagnosis</span>
                <p className="mt-1">{analysis.prescription_summary.diagnosis}</p>
              </div>
            )}
          </div>

          {/* Medicines */}
          <div className="space-y-4">
            <h3 className="section-title">Medicine Analysis</h3>
            {analysis.medicines.map((medicine, idx) => (
              <div key={idx} className="card">
                <button
                  className="w-full flex justify-between items-start"
                  onClick={() => setExpandedMedicine(expandedMedicine === idx ? null : idx)}
                >
                  <div className="text-left">
                    <h4 className="font-semibold text-lg">{medicine.name}</h4>
                    <p className="text-gray-500 text-sm">
                      {medicine.dosage} • {medicine.frequency}
                      {medicine.duration && ` • ${medicine.duration}`}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        {medicine.category}
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {medicine.purpose}
                      </span>
                    </div>
                  </div>
                  {expandedMedicine === idx ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedMedicine === idx && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    {/* How it works */}
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">How it works</h5>
                      <p className="text-sm text-gray-600">{medicine.how_it_works}</p>
                    </div>

                    {/* Pros and Cons */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Pros
                        </h5>
                        <ul className="space-y-2">
                          {medicine.pros.map((pro, i) => (
                            <li key={i} className="text-sm bg-green-50 p-2 rounded-lg">
                              <span className="font-medium">{pro.benefit}</span>
                              <p className="text-xs text-gray-600 mt-0.5">{pro.explanation}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> Cons
                        </h5>
                        <ul className="space-y-2">
                          {medicine.cons.map((con, i) => (
                            <li key={i} className="text-sm bg-red-50 p-2 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{con.risk}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(con.severity)}`}>
                                  {con.severity}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5">{con.mitigation}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Side Effects */}
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Side Effects</h5>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <span className="text-xs font-medium text-blue-700">Common</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {medicine.common_side_effects.map((se, i) => (
                              <span key={i} className="bg-white text-xs px-2 py-0.5 rounded">{se}</span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <span className="text-xs font-medium text-red-700">Serious - Seek Help</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {medicine.serious_side_effects.map((se, i) => (
                              <span key={i} className="bg-white text-xs px-2 py-0.5 rounded">{se}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Food Interactions */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h5 className="font-medium text-yellow-800 mb-2">Food Interactions</h5>
                      <p className="text-sm"><strong>Best time:</strong> {medicine.food_interactions.best_time_to_take}</p>
                      {medicine.food_interactions.foods_to_avoid.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Avoid:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {medicine.food_interactions.foods_to_avoid.map((food, i) => (
                              <span key={i} className="bg-white text-xs px-2 py-0.5 rounded">{food}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {medicine.food_interactions.notes && (
                        <p className="text-sm mt-2 text-gray-600">{medicine.food_interactions.notes}</p>
                      )}
                    </div>

                    {/* Drug Interactions */}
                    {medicine.drug_interactions.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Drug Interactions</h5>
                        <div className="flex flex-wrap gap-2">
                          {medicine.drug_interactions.map((drug, i) => (
                            <span key={i} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                              {drug}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Effectiveness */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-2">Patient Feedback</h5>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-medical-primary">
                            {medicine.patient_rating.effectiveness}/5
                          </p>
                          <p className="text-xs text-gray-500">Effectiveness</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-600">
                            {medicine.patient_rating.side_effects_level}
                          </p>
                          <p className="text-xs text-gray-500">Side Effects</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {medicine.patient_rating.ease_of_use}/5
                          </p>
                          <p className="text-xs text-gray-500">Ease of Use</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overall Assessment */}
          <div className="card">
            <h3 className="section-title">Overall Assessment</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-1">Treatment Appropriateness</h4>
                <p className="text-sm text-gray-600">{analysis.overall_assessment.treatment_appropriateness}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-1">Medicine Combination Safety</h4>
                <p className="text-sm text-gray-600">{analysis.overall_assessment.medicine_combination_safety}</p>
              </div>

              {analysis.overall_assessment.potential_interactions.length > 0 && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-800 mb-2">Potential Interactions</h4>
                  {analysis.overall_assessment.potential_interactions.map((interaction, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{interaction.medicines.join(' + ')}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(interaction.severity)}`}>
                          {interaction.severity}
                        </span>
                      </div>
                      <p className="text-sm">{interaction.interaction}</p>
                      <p className="text-sm text-gray-600 mt-0.5"><strong>Action:</strong> {interaction.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}

              {analysis.overall_assessment.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Suggestions</h4>
                  <ul className="space-y-2">
                    {analysis.overall_assessment.suggestions.map((sug, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full mt-0.5 ${
                          sug.importance === 'High' ? 'bg-red-100 text-red-800' :
                          sug.importance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sug.importance}
                        </span>
                        <div>
                          <p className="font-medium">{sug.suggestion}</p>
                          <p className="text-sm text-gray-500">{sug.reason}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Red Flags */}
          {(analysis.red_flags.immediate_medical_attention.length > 0 ||
            analysis.red_flags.when_to_stop_medicine.length > 0) && (
            <div className="card border-l-4 border-red-500 bg-red-50">
              <h3 className="section-title text-red-700">Important Warnings</h3>
              {analysis.red_flags.immediate_medical_attention.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-red-700 mb-1">Seek Immediate Medical Attention If:</h4>
                  <ul className="text-sm text-red-600 space-y-1">
                    {analysis.red_flags.immediate_medical_attention.map((flag, i) => (
                      <li key={i}>• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.red_flags.when_to_stop_medicine.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-1">Stop Medicine and Consult Doctor If:</h4>
                  <ul className="text-sm text-red-600 space-y-1">
                    {analysis.red_flags.when_to_stop_medicine.map((flag, i) => (
                      <li key={i}>• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center italic">
            {analysis.disclaimer}
          </p>
        </div>
      )}
    </div>
  )
}