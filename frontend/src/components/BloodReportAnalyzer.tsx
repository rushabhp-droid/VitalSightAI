'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Activity, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { analyzeBloodReport, BloodReportAnalysis } from '@/lib/api'

export default function BloodReportAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<BloodReportAnalysis | null>(null)
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({})

  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: '',
    conditions: ''
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
      const result = await analyzeBloodReport(file, {
        age: patientInfo.age ? parseInt(patientInfo.age) : undefined,
        gender: patientInfo.gender || undefined,
        conditions: patientInfo.conditions || undefined
      })
      setAnalysis(result.analysis)
      toast.success('Analysis complete!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal': return 'status-normal'
      case 'high': return 'status-high'
      case 'low': return 'status-low'
      case 'critical': return 'status-critical'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOverallStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'good': return 'text-green-600 bg-green-50'
      case 'fair': return 'text-yellow-600 bg-yellow-50'
      case 'needs attention': return 'text-orange-600 bg-orange-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="card">
        <h3 className="section-title flex items-center gap-2">
          <FileText className="w-5 h-5 text-medical-primary" />
          Upload Blood Report
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
              <p className="text-gray-600 font-medium">Drag & drop your blood report here</p>
              <p className="text-gray-400 text-sm mt-1">or click to browse</p>
              <p className="text-gray-400 text-xs mt-2">Supports PDF, PNG, JPG (max 10MB)</p>
            </div>
          )}
        </div>

        {/* Patient Info */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            placeholder="Known conditions (optional)"
            className="input-field"
            value={patientInfo.conditions}
            onChange={(e) => setPatientInfo({ ...patientInfo, conditions: e.target.value })}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!file || analyzing}
          className="btn-primary w-full mt-6"
        >
          {analyzing ? (
            <span className="flex items-center justify-center gap-2">
              <Activity className="w-5 h-5 animate-pulse" />
              Analyzing...
            </span>
          ) : (
            'Analyze Report'
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="card">
            <h3 className="section-title flex items-center gap-2">
              <Activity className="w-5 h-5 text-medical-primary" />
              Health Summary
            </h3>
            <div className={`p-4 rounded-xl ${getOverallStatusColor(analysis.summary.overall_health_status)}`}>
              <p className="font-semibold text-lg">{analysis.summary.overall_health_status}</p>
              <p className="mt-1">{analysis.summary.summary_text}</p>
            </div>
          </div>

          {/* Parameters */}
          <div className="card">
            <h3 className="section-title">Blood Parameters</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Parameter</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Value</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Range</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analysis.parameters.map((param, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{param.name}</td>
                      <td className="px-4 py-3">{param.value} {param.unit}</td>
                      <td className="px-4 py-3 text-gray-500 text-sm">{param.reference_range}</td>
                      <td className="px-4 py-3">
                        <span className={`status-badge ${getStatusColor(param.status)}`}>
                          {param.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Abnormal Findings */}
          {analysis.abnormal_findings.length > 0 && (
            <div className="card border-l-4 border-medical-warning">
              <h3 className="section-title flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Abnormal Findings
              </h3>
              <div className="space-y-4">
                {analysis.abnormal_findings.map((finding, idx) => (
                  <div key={idx} className="bg-yellow-50 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{finding.parameter}</h4>
                        <p className="text-sm text-gray-600">
                          Value: <span className="font-medium">{finding.value}</span>
                          <span className={`status-badge ml-2 ${getStatusColor(finding.status)}`}>
                            {finding.status}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDetails({ ...showDetails, [`finding-${idx}`]: !showDetails[`finding-${idx}`] })}
                        className="text-medical-primary hover:text-blue-700"
                      >
                        {showDetails[`finding-${idx}`] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                    {showDetails[`finding-${idx}`] && (
                      <div className="mt-3 space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Possible causes:</span>
                          <ul className="list-disc list-inside text-gray-600">
                            {finding.possible_causes.map((cause, i) => <li key={i}>{cause}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Recommendations:</span>
                          <ul className="list-disc list-inside text-gray-600">
                            {finding.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Insights */}
          <div className="card">
            <h3 className="section-title">Health Insights</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {analysis.health_insights.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-orange-600 mb-2">Areas of Concern</h4>
                <ul className="space-y-1">
                  {analysis.health_insights.areas_of_concern.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Lifestyle Recommendations */}
            {analysis.health_insights.lifestyle_recommendations.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Lifestyle Recommendations</h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysis.health_insights.lifestyle_recommendations.map((rec, i) => (
                    <div key={i} className="bg-blue-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-medical-primary">{rec.category}</span>
                      <p className="text-sm mt-1">{rec.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dietary Suggestions */}
          <div className="card">
            <h3 className="section-title">Dietary Suggestions</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-600 mb-2">Foods to Include</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.health_insights.dietary_suggestions.foods_to_include.map((food, i) => (
                    <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {food}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-red-600 mb-2">Foods to Limit</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.health_insights.dietary_suggestions.foods_to_limit.map((food, i) => (
                    <span key={i} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Follow-up */}
          <div className="card bg-gray-50">
            <h3 className="section-title">Follow-up Recommendations</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Tests to Repeat</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {analysis.follow_up.tests_to_repeat.map((test, i) => (
                    <li key={i}>• {test}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Monitoring</h4>
                <p className="text-sm text-gray-600">{analysis.follow_up.monitoring_frequency}</p>
              </div>
            </div>
            {analysis.follow_up.warning_signs.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-700 mb-1">Warning Signs - Seek Immediate Medical Attention</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  {analysis.follow_up.warning_signs.map((sign, i) => (
                    <li key={i}>• {sign}</li>
                  ))}
                </ul>
              </div>
            )}
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