import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ExcelFile from '../models/ExcelFile.js';
import { authenticate } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed'), false);
    }
  }
});

// Upload Excel file
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheets = [];
    let totalRows = 0;
    let totalColumns = 0;

    // Process each sheet
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      sheets.push({
        name: sheetName,
        data: jsonData,
        rowCount: jsonData.length,
        columnCount: jsonData[0]?.length || 0
      });

      totalRows += jsonData.length;
      totalColumns = Math.max(totalColumns, jsonData[0]?.length || 0);
    });

    // Save file info to database
    const excelFile = new ExcelFile({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user._id,
      sheets,
      metadata: {
        totalRows,
        totalColumns,
        sheetCount: sheets.length,
        fileType: path.extname(req.file.originalname)
      }
    });

    await excelFile.save();

    res.json({
      message: 'File uploaded successfully',
      file: excelFile
    });
  } catch (error) {
    // Clean up uploaded file if there's an error
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Get all files for user
router.get('/', authenticate, async (req, res) => {
  try {
    const files = await ExcelFile.find({ uploadedBy: req.user._id })
      .select('-sheets.data')
      .sort({ createdAt: -1 });
    
    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch files', error: error.message });
  }
});

// Get specific file with data
router.get('/:id', authenticate, async (req, res) => {
  try {
    const file = await ExcelFile.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({ file });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch file', error: error.message });
  }
});

// Delete file
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const file = await ExcelFile.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete physical file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete from database
    await ExcelFile.findByIdAndDelete(req.params.id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
});

export default router;