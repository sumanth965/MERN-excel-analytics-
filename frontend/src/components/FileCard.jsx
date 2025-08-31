import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FileSpreadsheet, 
  Calendar, 
  Database, 
  BarChart3, 
  Trash2,
  Eye 
} from 'lucide-react'
import { formatFileSize, formatDate } from '../utils/helpers'

const FileCard = ({ file, onDelete }) => {
  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this file?')) {
      onDelete(file._id)
    }
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FileSpreadsheet className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 truncate max-w-xs">
              {file.originalName}
            </h3>
            <p className="text-sm text-gray-500">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleDelete}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2 text-gray-600">
          <Database className="h-4 w-4" />
          <span>{file.metadata.sheetCount} sheets</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(file.createdAt)}</span>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <Link
          to={`/file/${file._id}`}
          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
        >
          <Eye className="h-4 w-4" />
          <span>View</span>
        </Link>
        
        <Link
          to={`/analytics/${file._id}`}
          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Analytics</span>
        </Link>
      </div>
    </div>
  )
}

export default FileCard