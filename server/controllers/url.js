const URL     = require('../models/url');
const redis   = require('../config/redis');       
const { encode } = require('../utils/base62');

// POST /url
async function handleCreateShortUrl(req, res) {
    const { url, customAlias, expiresAt } = req.body;

    if (!url) return res.status(400).json({ error: 'URL is required' });

    // validate URL format
    try { new URL(url); }
    catch { return res.status(400).json({ error: 'Invalid URL' }); }

    let shortId;

    if (customAlias) {
        // user provided their own alias
        const taken = await URL.findOne({ shortId: customAlias });
        if (taken) return res.status(409).json({ error: 'Alias already taken' });
        shortId = customAlias;
    } else {
        // auto-generate via Base62 + Redis counter
        const counter = await redis.incr('url:counter');
        shortId = encode(counter);                // e.g. 1 → "b", 1000 → "qi"
    }

    try {
        const entry = await URL.create({
            shortId,
            redirectUrl: url,
            customAlias: !!customAlias,
            expiresAt:   expiresAt ? new Date(expiresAt) : null,
            createdBy:   req.user?.id,            // from JWT middleware
        });

        return res.status(201).json({
            shortId:    entry.shortId,
            shortUrl:   `${process.env.BASE_URL}/${entry.shortId}`,
            expiresAt:  entry.expiresAt,
        });

    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ error: 'Conflict, retry' });
        return res.status(500).json({ error: 'Server error' });
    }
}

// GET /:shortId
async function handleRedirect(req, res) {
    const { shortId } = req.params;

    // 1. check Redis cache first
    const cached = await redis.get(`url:${shortId}`);
    if (cached) {
        // still log the visit, but don't block the redirect on it
        URL.findOneAndUpdate(
            { shortId },
            { $push: { visitHistory: { timeStamp: new Date(), ip: req.ip, userAgent: req.headers['user-agent'] } } }
        ).exec();

        return res.redirect(cached);              // sub-10ms path
    }

    // 2. cache miss — hit MongoDB
    const entry = await URL.findOne({ shortId });

    if (!entry)          return res.status(404).json({ error: 'Not found' });
    if (!entry.isActive) return res.status(410).json({ error: 'Link disabled' });
    if (entry.expiresAt && entry.expiresAt < new Date()) {
        return res.status(410).json({ error: 'Link expired' });
    }

    // 3. cache for next time (TTL matches expiry if set, else 24hr)
    const ttl = entry.expiresAt
        ? Math.floor((entry.expiresAt - Date.now()) / 1000)
        : 86400;

    await redis.setEx(`url:${shortId}`, ttl, entry.redirectUrl);

    // 4. log visit
    await URL.findOneAndUpdate(
        { shortId },
        { $push: { visitHistory: { timeStamp: new Date(), ip: req.ip, userAgent: req.headers['user-agent'] } } }
    );

    return res.redirect(entry.redirectUrl);
}

// GET /url/:shortId/analytics
async function handleGetAnalytics(req, res) {
    const { shortId } = req.params;

    const entry = await URL.findOne({ shortId });
    if (!entry) return res.status(404).json({ error: 'Not found' });

    // only owner can see analytics
    if (entry.createdBy?.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json({
        shortId:      entry.shortId,
        redirectUrl:  entry.redirectUrl,
        totalClicks:  entry.visitHistory.length,
        visitHistory: entry.visitHistory,
        createdAt:    entry.createdAt,
        expiresAt:    entry.expiresAt,
        isActive:     entry.isActive,
    });
}

// PATCH /url/:shortId
async function handleToggleActive(req, res) {
    const { shortId } = req.params;
    const { isActive } = req.body;

    const entry = await URL.findOne({ shortId });
    if (!entry) return res.status(404).json({ error: 'Not found' });

    if (entry.createdBy?.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    entry.isActive = isActive;
    await entry.save();

    // invalidate Redis cache when link is disabled
    if (!isActive) await redis.del(`url:${shortId}`);

    return res.json({ shortId, isActive: entry.isActive });
}

module.exports = {
    handleCreateShortUrl,
    handleRedirect,
    handleGetAnalytics,
    handleToggleActive,
};