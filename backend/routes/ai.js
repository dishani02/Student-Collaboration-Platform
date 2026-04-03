const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  suggestResources,
  recommendSessions,
  suggestSessionVideos,
  generateQuiz
} = require('../controllers/aiController');

// All AI routes are protected
router.use(protect);

// GET /api/ai/suggest-resources?query=...
router.get('/suggest-resources', suggestResources);

// GET /api/ai/recommend-sessions
router.get('/recommend-sessions', recommendSessions);

// GET /api/ai/suggest-session-videos?query=...
router.get('/suggest-session-videos', suggestSessionVideos);

// POST /api/ai/generate-quiz
const upload = require('../middleware/upload');
router.post('/generate-quiz', upload.single('file'), generateQuiz);

module.exports = router;
