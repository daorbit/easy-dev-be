const express = require('express');
const router = express.Router();
const {
  getSnippets,
  getSnippet,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  getLanguages,
  getTags,
} = require('../controllers/snippetsController');

// All routes require authentication (handled in controller)
router.route('/')
  .get(getSnippets)
  .post(createSnippet);

router.route('/:id')
  .get(getSnippet)
  .put(updateSnippet)
  .delete(deleteSnippet);

router.get('/meta/languages', getLanguages);
router.get('/meta/tags', getTags);

module.exports = router;