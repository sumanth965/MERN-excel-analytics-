import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Upload, FileSpreadsheet, BarChart3, Plus } from 'lucide-react'
import api from '../services/api'
import FileCard from '../components/FileCard'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSheets: 0,
    totalRows: 0,
  })

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await api.get('/files')
      const filesData = response.data.files
      setFiles(filesData)

      const totalFiles = filesData.length
      const totalSheets = filesData.reduce((sum, file) => sum + file.metadata.sheetCount, 0)
      const totalRows = filesData.reduce((sum, file) => sum + file.metadata.totalRows, 0)

      setStats({ totalFiles, totalSheets, totalRows })
    } catch (error) {
      toast.error('Failed to fetch files')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFile = async (fileId) => {
    try {
      await api.delete(`/files/${fileId}`)
      setFiles(files.filter((file) => file._id !== fileId))
      toast.success('File deleted successfully')
    } catch (error) {
      toast.error('Failed to delete file')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-sky-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            Manage and analyze your uploaded Excel files
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Files', value: stats.totalFiles, color: 'blue', icon: FileSpreadsheet },
            { label: 'Total Sheets', value: stats.totalSheets, color: 'green', icon: BarChart3 },
            { label: 'Total Rows', value: stats.totalRows.toLocaleString(), color: 'purple', icon: Upload },
          ].map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                className="p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                    <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Files Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Your Files</h2>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition font-medium"
          >
            <Plus className="h-5 w-5" />
            <span>Upload File</span>
          </Link>
        </div>

        {files.length === 0 ? (
          <div className="text-center bg-white rounded-xl p-10 shadow-md">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No files found</h3>
            <p className="mt-2 text-gray-500 text-sm">
              Get started by uploading your first Excel file.
            </p>
            <div className="mt-6">
              <Link
                to="/upload"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow"
              >
                Upload File
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <FileCard key={file._id} file={file} onDelete={handleDeleteFile} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
