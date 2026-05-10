import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { VerificationsPage, ProjectTestsPage, TestDetailPage, RunDetail } from './modules/product-verification/index.jsx'

function App() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<VerificationsPage />} />
          <Route path="/projects/:projectId/tests" element={<ProjectTestsPage />} />
          <Route path="/projects/:projectId/tests/:testPath" element={<TestDetailPage />} />
          <Route path="/runs/:id" element={<RunDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
