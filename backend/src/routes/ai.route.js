const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ai.controller');
const authenticate = require('../middlewares/authenticate');
const allowRoles = require('../middlewares/allowRoles');

router.use(authenticate);

// Expected to be used primarily by Students, but keeping it open for any role to test.
// True data masking happens in the service based on req.user payload.
router.post(
    '/ask',
    allowRoles('Student'),
    ctrl.askAI
);

router.get(
    '/history',
    allowRoles('Student'),
    ctrl.getChatHistory
);

module.exports = router;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
