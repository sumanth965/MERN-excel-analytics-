import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BarChart3, Download, FileSpreadsheet } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const FileView = () => {
  const { id } = useParams()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSheet, setActiveSheet] = useState(0)

  useEffect(() => {
    fetchFile()
  }, [id])

  const fetchFile = async () => {
    try {
      const response = await api.get(`/files/${id}`)
      setFile(response.data.file)
    } catch (error) {
      toast.error('Failed to fetch file')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!file) {
    return (
      <div className="colorful-bg max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">File not found</h2>
          <Link to="/dashboard" className="mt-4 btn-primary inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const currentSheet = file.sheets[activeSheet]

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
            <h1 className="text-3xl font-bold text-gray-900">
              {file.originalName}
            </h1>
            <p className="text-gray-600">
              {file.metadata.sheetCount} sheets • {file.metadata.totalRows.toLocaleString()} rows
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Link
            to={`/analytics/${file._id}`}
            className="btn-primary flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>View Analytics</span>
          </Link>
        </div>
      </div>

      {/* Sheet Tabs */}
      {file.sheets.length > 1 && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {file.sheets.map((sheet, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSheet(index)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSheet === index
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {sheet.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Sheet Data */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {currentSheet.name}
          </h3>
          <div className="text-sm text-gray-500">
            {currentSheet.rowCount} rows × {currentSheet.columnCount} columns
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {currentSheet.data[0]?.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header || `Column ${index + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSheet.data.slice(1, 101).map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {cell || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentSheet.data.length > 101 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Showing first 100 rows of {currentSheet.rowCount} total rows
          </div>
        )}
      </div>
    </div>
  )
}

export default FileView