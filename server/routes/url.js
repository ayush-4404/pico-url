const express        = require('express');
const router         = express.Router();
const authMiddleware = require('../middlewares/auth');
const {
    handleCreateShortUrl,
    handleRedirect,
    handleGetAnalytics,
    handleGetMyUrls,
    handleDeleteUrl,
    handleToggleActive,
} = require('../controllers/url');

// Static paths MUST come before /:shortId wildcard
router.post('/url',                   authMiddleware, handleCreateShortUrl);  // protected
router.get('/url/my-urls',            authMiddleware, handleGetMyUrls);       // protected
router.get('/url/:shortId/analytics', authMiddleware, handleGetAnalytics);    // protected
router.patch('/url/:shortId',         authMiddleware, handleToggleActive);     // protected
router.delete('/url/:shortId',        authMiddleware, handleDeleteUrl);        // protected
router.get('/:shortId',                               handleRedirect);         // public — last

module.exports = router;