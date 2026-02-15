const multer = require('multer');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const path = require('path');

// Configure multer for file upload (memory storage for Vercel)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @desc    Convert Excel to PDF
// @route   POST /api/converter/excel-to-pdf
// @access  Public
const convertExcelToPdf = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Read Excel file from buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Create PDF in memory
    const doc = new PDFDocument();
    const chunks = [];
    const stream = require('stream');

    // Collect PDF data in memory
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      // Send the PDF file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="converted.pdf"');
      res.send(pdfBuffer);
    });

    // Add title
    doc.fontSize(18).text('Excel to PDF Conversion', { align: 'center' });
    doc.moveDown();

    // Add table data
    jsonData.forEach((row, index) => {
      if (index === 0) {
        // Header row
        doc.fontSize(12).font('Helvetica-Bold');
      } else {
        doc.fontSize(10).font('Helvetica');
      }
      doc.text(row.join(' | '));
      doc.moveDown(0.5);
    });

    doc.end();

  } catch (error) {
    console.error('Conversion error:', error);
    return res.status(500).json({ message: 'Conversion failed' });
  }
};

module.exports = {
  upload,
  convertExcelToPdf
};