const Snippet = require('../models/Snippet');
const jwt = require('jsonwebtoken');

const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    return decoded.id;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// @desc    Get all snippets for a user
// @route   GET /api/snippets
// @access  Private
exports.getSnippets = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = getUserIdFromToken(token);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const language = req.query.language;
    const tag = req.query.tag;
    const search = req.query.search;

    let query = { user: userId };

    // Add filters
    if (language) {
      query.language = language;
    }
    if (tag) {
      query.tags = { $in: [tag] };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const snippets = await Snippet.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalSnippets = await Snippet.countDocuments(query);
    const totalPages = Math.ceil(totalSnippets / limit);

    res.json({
      snippets,
      pagination: {
        currentPage: page,
        totalPages,
        totalSnippets,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single snippet
// @route   GET /api/snippets/:id
// @access  Private
exports.getSnippet = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = getUserIdFromToken(token);
    const snippet = await Snippet.findOne({ _id: req.params.id, user: userId });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    res.json(snippet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a snippet
// @route   POST /api/snippets
// @access  Private
exports.createSnippet = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = getUserIdFromToken(token);
    const { title, description, code, language, tags = [] } = req.body;

    const snippet = await Snippet.create({
      title,
      description,
      code,
      language,
      user: userId,
      tags,
    });

    res.status(201).json(snippet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a snippet
// @route   PUT /api/snippets/:id
// @access  Private
exports.updateSnippet = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = getUserIdFromToken(token);
    const { title, description, code, language, tags } = req.body;

    const snippet = await Snippet.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { title, description, code, language, tags, updatedAt: new Date() },
      { new: true }
    );

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    res.json(snippet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a snippet
// @route   DELETE /api/snippets/:id
// @access  Private
exports.deleteSnippet = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = getUserIdFromToken(token);

    const snippet = await Snippet.findOneAndDelete({ _id: req.params.id, user: userId });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unique languages
// @route   GET /api/snippets/languages
// @access  Private
exports.getLanguages = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = getUserIdFromToken(token);
    const languages = await Snippet.distinct('language', { user: userId });

    res.json(languages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unique tags
// @route   GET /api/snippets/tags
// @access  Private
exports.getTags = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = getUserIdFromToken(token);
    const tags = await Snippet.distinct('tags', { user: userId });

    // Flatten the array of arrays
    const flattenedTags = [...new Set(tags.flat())];

    res.json(flattenedTags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};