// //backend/routes/sessionRequests.js

// const express = require('express');
// const router = express.Router();
// const { protect, authorize } = require('../middleware/auth');
// const SessionRequest = require('../models/SessionRequest');

// router.use(protect);

// // POST /api/session-requests - Student/Expert submit a session request
// router.post('/', async (req, res) => {
//   try {
//     const { topic, moduleCode, reason } = req.body;
//     if (!topic || !reason) {
//       return res.status(400).json({ success: false, message: 'Topic and reason are required' });
//     }
//     const sr = await SessionRequest.create({
//       user: req.user._id,
//       topic: topic.trim(),
//       moduleCode: (moduleCode || '').trim(),
//       reason: reason.trim()
//     });
//     const populated = await SessionRequest.findById(sr._id).populate('user', 'fullName email');
//     res.status(201).json({ success: true, sessionRequest: populated });
//   } catch (error) {
//     console.error('Create session request error:', error);
//     res.status(500).json({ success: false, message: 'Failed to submit request', error: error.message });
//   }
// });

// // GET /api/session-requests - Admin only: list all session requests (message history)
// router.get('/', authorize('admin'), async (req, res) => {
//   try {
//     const list = await SessionRequest.find()
//       .populate('user', 'fullName email role')
//       .sort({ createdAt: -1 });
//     res.json({ success: true, sessionRequests: list });
//   } catch (error) {
//     console.error('List session requests error:', error);
//     res.status(500).json({ success: false, message: 'Failed to load requests', error: error.message });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createSessionRequest,
  getAllSessionRequests,
  getMySessionRequests,
  updateRequestStatus,
  deleteSessionRequest,
  markRequestMessageSeen
} = require('../controllers/sessionRequestController');

// All routes require authentication
router.use(protect);

// Student/Expert routes
router.post('/', createSessionRequest);
router.get('/my-requests', getMySessionRequests);

// Admin-only routes
router.get('/', authorize('admin'), getAllSessionRequests);
router.patch('/:id/status', authorize('admin'), updateRequestStatus);
router.patch('/:id/message-status', authorize('admin'), markRequestMessageSeen);

// Delete (owner or admin)
router.delete('/:id', deleteSessionRequest);

module.exports = router;