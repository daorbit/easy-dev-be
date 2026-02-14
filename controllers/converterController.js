const multer = require('multer');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Ensure uploads directory exists
if (!fs.existsSync('uploads/')) {
  fs.mkdirSync('uploads/');
}

// @desc    Convert Excel to PDF
// @route   POST /api/converter/excel-to-pdf
// @access  Public
const convertExcelToPdf = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const inputPath = req.file.path;
  const outputPath = inputPath.replace(path.extname(inputPath), '.pdf');

  try {
    // Read Excel file
    const workbook = XLSX.readFile(inputPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Create PDF
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

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

    stream.on('finish', () => {
      // Send the PDF file
      res.download(outputPath, 'converted.pdf', (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        // Clean up files
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    });

  } catch (error) {
    console.error('Conversion error:', error);
    return res.status(500).json({ message: 'Conversion failed' });
  }
};

module.exports = {
  upload,
  convertExcelToPdf
};