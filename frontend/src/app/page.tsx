'use client'

import { useState } from 'react'
import { FileUp, Activity, Pill, Menu, X } from 'lucide-react'
import BloodReportAnalyzer from '@/components/BloodReportAnalyzer'
import PrescriptionAnalyzer from '@/components/PrescriptionAnalyzer'
import MedicineAnalyzer from '@/components/MedicineAnalyzer'

type Tab = 'blood' | 'prescription' | 'medicine'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('blood')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tabs = [
    { id: 'blood' as Tab, label: 'Blood Report', icon: Activity },
    { id: 'prescription' as Tab, label: 'Prescription', icon: FileUp },
    { id: 'medicine' as Tab, label: 'Medicine', icon: Pill },
  ]

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-medical-primary to-medical-secondary rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-medical-primary to-medical-secondary bg-clip-text text-transparent">
                  VitalSightAI
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">AI-Powered Health Analysis</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-medical-primary text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-medical-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Understand Your Health with AI
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your blood reports or prescriptions to get detailed insights,
            medicine analysis, and personalized health recommendations powered by AI.
          </p>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'blood' && <BloodReportAnalyzer />}
          {activeTab === 'prescription' && <PrescriptionAnalyzer />}
          {activeTab === 'medicine' && <MedicineAnalyzer />}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-medical-primary to-medical-secondary rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-700">VitalSightAI</span>
            </div>
            <p className="text-sm text-gray-500 text-center">
              For informational purposes only. Always consult a healthcare professional.
            </p>
            <div className="flex space-x-4 text-sm text-gray-500">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}