const Note = require('../models/Note');
const jwt = require('jsonwebtoken');

const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    return decoded.id;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = getUserIdFromToken(token);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notes = await Note.find({ user: userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotes = await Note.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalNotes / limit);

    res.json({
      notes,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotes,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
exports.getNote = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = getUserIdFromToken(token);
    const note = await Note.findOne({ _id: req.params.id, user: userId });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a note (draft or saved)
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = getUserIdFromToken(token);
    const { title, content, isDraft = true, tags = [] } = req.body;

    const note = await Note.create({
      title,
      content,
      user: userId,
      isDraft,
      tags,
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = getUserIdFromToken(token);
    const { title, content, isDraft, tags } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { title, content, isDraft, tags, updatedAt: new Date() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = getUserIdFromToken(token);

    const note = await Note.findOneAndDelete({ _id: req.params.id, user: userId });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save draft to database (convert draft to saved note)
// @route   POST /api/notes/:id/save
// @access  Private
exports.saveDraft = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = getUserIdFromToken(token);

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { isDraft: false, updatedAt: new Date() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};