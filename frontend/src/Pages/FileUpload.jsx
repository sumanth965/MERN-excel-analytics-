import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, X, CheckCircle } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const FileUpload = () => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const navigate = useNavigate()

  const onDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    }))
    setFiles(prev => [...prev, ...newFiles])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id))
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    const results = []

    for (const fileItem of files) {
      if (fileItem.status === 'uploaded') continue

      try {
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: 0 }))
        
        const formData = new FormData()
        formData.append('file', fileItem.file)

        const response = await api.post('/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setUploadProgress(prev => ({ ...prev, [fileItem.id]: progress }))
          }
        })

        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'uploaded', uploadedFile: response.data.file }
            : f
        ))

        results.push(response.data.file)
        toast.success(`${fileItem.file.name} uploaded successfully`)
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'error', error: error.response?.data?.message || 'Upload failed' }
            : f
        ))
        toast.error(`Failed to upload ${fileItem.file.name}`)
      }
    }

    setUploading(false)
    
    if (results.length === 1) {
      navigate(`/file/${results[0]._id}`)
    } else if (results.length > 1) {
      navigate('/dashboard')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Excel Files</h1>
        <p className="mt-2 text-gray-600">
          Upload your Excel or CSV files to start analyzing your data
        </p>
      </div>

      {/* Upload Area */}
      <div className="card mb-8">
        <div
          {...getRootProps()}
          className={`upload-area ${isDragActive ? 'drag-active' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-lg font-medium text-gray-900">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            or click to browse files
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Supports .xlsx, .xls, .csv files up to 50MB
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Files to Upload ({files.length})
            </h3>
            <button
              onClick={uploadFiles}
              disabled={uploading || files.every(f => f.status === 'uploaded')}
              className="btn-primary flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload All</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {fileItem.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(fileItem.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {fileItem.status === 'pending' && (
                    <span className="text-sm text-gray-500">Pending</span>
                  )}
                  
                  {fileItem.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[fileItem.id] || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {uploadProgress[fileItem.id] || 0}%
                      </span>
                    </div>
                  )}
                  
                  {fileItem.status === 'uploaded' && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Uploaded</span>
                    </div>
                  )}
                  
                  {fileItem.status === 'error' && (
                    <span className="text-sm text-red-600">
                      {fileItem.error}
                    </span>
                  )}

                  {fileItem.status !== 'uploaded' && (
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload