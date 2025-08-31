import mongoose from 'mongoose';

const excelFileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sheets: [{
    name: String,
    data: mongoose.Schema.Types.Mixed,
    rowCount: Number,
    columnCount: Number
  }],
  metadata: {
    totalRows: Number,
    totalColumns: Number,
    sheetCount: Number,
    fileType: String
  },
  analytics: {
    processed: {
      type: Boolean,
      default: false
    },
    summary: mongoose.Schema.Types.Mixed,
    charts: [mongoose.Schema.Types.Mixed]
  }
}, {
  timestamps: true
});

export default mongoose.model('ExcelFile', excelFileSchema);