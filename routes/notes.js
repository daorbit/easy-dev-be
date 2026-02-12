const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  saveDraft,
} = require('../controllers/notesController');

// All routes require authentication (handled in controller)
router.route('/')
  .get(getNotes)
  .post(createNote);

router.route('/:id')
  .get(getNote)
  .put(updateNote)
  .delete(deleteNote);

router.post('/:id/save', saveDraft);

module.exports = router;