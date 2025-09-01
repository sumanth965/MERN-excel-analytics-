import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BarChart3, TrendingUp, Database, FileText } from 'lucide-react'
import api from '../services/api'
import Chart from '../components/Chart'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Analytics = () => {
  const { id } = useParams()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [id])

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/analytics/${id}`)
      setAnalytics(response.data)
    } catch (error) {
      if (error.response?.status === 400) {
        // Analytics not generated yet
        setAnalytics(null)
      } else {
        toast.error('Failed to fetch analytics')
      }
    } finally {
      setLoading(false)
    }
  }

  const generateAnalytics = async () => {
    setGenerating(true)
    try {
      const response = await api.post(`/analytics/${id}/analyze`)
      setAnalytics({
        analytics: response.data.analytics,
        filename: 'Generated Analytics'
      })
      toast.success('Analytics generated successfully!')
    } catch (error) {
      toast.error('Failed to generate analytics')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">
              {analytics?.filename || 'File Analytics'}
            </p>
          </div>
        </div>

        {!analytics && (
          <button
            onClick={generateAnalytics}
            disabled={generating}
            className="btn-primary flex items-center space-x-2"
          >
            {generating ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                <span>Generate Analytics</span>
              </>
            )}
          </button>
        )}
      </div>

      {!analytics ? (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No analytics available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate analytics to see insights about your data.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sheets</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.analytics.summary.totalSheets}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Rows</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.analytics.summary.totalRows.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Cells</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.analytics.summary.totalCells.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Null Values</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.analytics.summary.nullValues.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Types */}
          <div className="card mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Data Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analytics.analytics.summary.dataTypes).map(([column, type]) => (
                <div key={column} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{column}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    type === 'number' ? 'bg-blue-100 text-blue-800' :
                    type === 'date' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          {analytics.analytics.charts.length > 0 && (
            <div className="space-y-8">
              <h3 className="text-lg font-medium text-gray-900">Data Visualizations</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {analytics.analytics.charts.map((chart, index) => (
                  <div key={index} className="card">
                    <Chart
                      type={chart.type}
                      data={chart.data}
                      title={chart.title}
                    />
                    {chart.sheet && (
                      <p className="mt-2 text-sm text-gray-500">
                        Sheet: {chart.sheet}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Analytics