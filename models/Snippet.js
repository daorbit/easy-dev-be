const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Index for better query performance
snippetSchema.index({ user: 1, createdAt: -1 });
snippetSchema.index({ user: 1, language: 1 });
snippetSchema.index({ user: 1, tags: 1 });

module.exports = mongoose.model('Snippet', snippetSchema);