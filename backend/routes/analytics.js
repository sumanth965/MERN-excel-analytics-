import express from 'express';
import ExcelFile from '../models/ExcelFile.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate analytics for a file
router.post('/:id/analyze', authenticate, async (req, res) => {
  try {
    const file = await ExcelFile.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const analytics = generateAnalytics(file.sheets);
    
    // Update file with analytics
    file.analytics = {
      processed: true,
      summary: analytics.summary,
      charts: analytics.charts
    };
    
    await file.save();

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ message: 'Analytics generation failed', error: error.message });
  }
});

// Get analytics for a file
router.get('/:id', authenticate, async (req, res) => {
  try {
    const file = await ExcelFile.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id
    }).select('analytics metadata originalName');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (!file.analytics.processed) {
      return res.status(400).json({ message: 'Analytics not generated yet' });
    }

    res.json({ analytics: file.analytics, metadata: file.metadata, filename: file.originalName });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

// Helper function to generate analytics
function generateAnalytics(sheets) {
  const summary = {
    totalSheets: sheets.length,
    totalRows: 0,
    totalCells: 0,
    dataTypes: {},
    nullValues: 0
  };

  const charts = [];

  sheets.forEach((sheet, sheetIndex) => {
    if (!sheet.data || sheet.data.length === 0) return;

    const sheetData = sheet.data;
    const headers = sheetData[0] || [];
    const rows = sheetData.slice(1);

    summary.totalRows += rows.length;
    summary.totalCells += rows.length * headers.length;

    // Analyze each column
    headers.forEach((header, colIndex) => {
      const columnData = rows.map(row => row[colIndex]).filter(val => val !== undefined && val !== null && val !== '');
      
      if (columnData.length === 0) return;

      // Determine data type
      const dataType = detectDataType(columnData);
      summary.dataTypes[header] = dataType;

      // Count null values
      const nullCount = rows.length - columnData.length;
      summary.nullValues += nullCount;

      // Generate chart data based on data type
      if (dataType === 'number') {
        const numericData = columnData.map(val => parseFloat(val)).filter(val => !isNaN(val));
        if (numericData.length > 0) {
          charts.push({
            type: 'line',
            title: `${header} Trend`,
            data: {
              labels: numericData.map((_, i) => `Row ${i + 1}`),
              datasets: [{
                label: header,
                data: numericData,
                borderColor: getRandomColor(),
                backgroundColor: getRandomColor(0.2)
              }]
            },
            sheet: sheet.name
          });

          // Add histogram for numeric data
          const histogram = createHistogram(numericData, header);
          charts.push(histogram);
        }
      } else if (dataType === 'string') {
        const frequency = getFrequency(columnData);
        const topValues = Object.entries(frequency)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10);

        if (topValues.length > 0) {
          charts.push({
            type: 'bar',
            title: `${header} Distribution`,
            data: {
              labels: topValues.map(([label]) => label),
              datasets: [{
                label: 'Count',
                data: topValues.map(([, count]) => count),
                backgroundColor: topValues.map(() => getRandomColor(0.6))
              }]
            },
            sheet: sheet.name
          });
        }
      }
    });
  });

  return { summary, charts };
}

function detectDataType(data) {
  const sample = data.slice(0, Math.min(100, data.length));
  let numberCount = 0;
  let dateCount = 0;

  sample.forEach(val => {
    if (!isNaN(parseFloat(val)) && isFinite(val)) {
      numberCount++;
    } else if (isValidDate(val)) {
      dateCount++;
    }
  });

  const numberRatio = numberCount / sample.length;
  const dateRatio = dateCount / sample.length;

  if (numberRatio > 0.8) return 'number';
  if (dateRatio > 0.8) return 'date';
  return 'string';
}

function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

function getFrequency(data) {
  return data.reduce((freq, item) => {
    freq[item] = (freq[item] || 0) + 1;
    return freq;
  }, {});
}

function createHistogram(data, label) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binCount = Math.min(10, Math.ceil(Math.sqrt(data.length)));
  const binSize = (max - min) / binCount;
  
  const bins = Array(binCount).fill(0);
  const binLabels = [];

  for (let i = 0; i < binCount; i++) {
    const binStart = min + i * binSize;
    const binEnd = min + (i + 1) * binSize;
    binLabels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);
  }

  data.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
    bins[binIndex]++;
  });

  return {
    type: 'bar',
    title: `${label} Distribution`,
    data: {
      labels: binLabels,
      datasets: [{
        label: 'Frequency',
        data: bins,
        backgroundColor: getRandomColor(0.6)
      }]
    }
  };
}

function getRandomColor(alpha = 1) {
  const colors = [
    `rgba(255, 99, 132, ${alpha})`,
    `rgba(54, 162, 235, ${alpha})`,
    `rgba(255, 205, 86, ${alpha})`,
    `rgba(75, 192, 192, ${alpha})`,
    `rgba(153, 102, 255, ${alpha})`,
    `rgba(255, 159, 64, ${alpha})`
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default router;