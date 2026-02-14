const express = require('express');
const router = express.Router();
const { upload, convertExcelToPdf } = require('../controllers/converterController');

// @route   POST /api/converter/excel-to-pdf
// @desc    Convert Excel file to PDF
// @access  Public
router.post('/excel-to-pdf', upload.single('file'), convertExcelToPdf);

module.exports = router;