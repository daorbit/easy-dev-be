const axios = require('axios');
const jwt = require('jsonwebtoken');

const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    return decoded.id;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// @desc    Process text using AI (fix English, format content, generate content)
// @route   POST /api/ai/process-text
// @access  Private
exports.processText = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const userId = getUserIdFromToken(token);
    const { action, text } = req.body;

    if (!action || !text) {
      return res.status(400).json({ message: 'Action and text are required' });
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Perplexity API key not configured' });
    }

    let prompt;
    switch (action) {
      case 'fix-english':
        prompt = `Fix the grammar, spelling, and formatting of this text. Make it more readable and professional. Only return the corrected text without any additional comments:\n\n${text}`;
        break;
      case 'format-content':
        prompt = `Format this content for better readability and structure. Only return the formatted text without any additional comments:\n\n${text}`;
        break;
      case 'generate-content':
        prompt = `Generate content based on this prompt. Only return the generated content without any additional comments:\n\n${text}`;
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'sonar', // Free sonar model with online capabilities
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const processedText = response.data.choices[0].message.content.trim();

    // Clean the text by removing unwanted characters and formatting
    const cleanedText = processedText
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\[/g, '')   // Remove brackets
      .replace(/\]/g, '')
      .replace(/###/g, '')  // Remove headers
      .replace(/^\s*-\s*/gm, '') // Remove list markers
      .replace(/[0-9,]/g, '') // Remove numbers and commas
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    res.json({ processedText: cleanedText });
  } catch (error) {
    console.error('Perplexity API error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error?.message || 'Failed to process text with AI';
    res.status(500).json({ message: errorMessage });
  }
};