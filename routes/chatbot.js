const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

/**
 * @route   POST /api/chatbot/message
 * @desc    Ingest natural language queries and return matched language parameters
 * @access  Public / Authenticated
 */
router.post('/message', chatbotController.processMessageInput);

module.exports = router;
