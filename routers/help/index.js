const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
    return res.status(200).end('health OK!');
});

// tell-me
const tellMeRouter = require('./tell-me');
router.use('/tellme', tellMeRouter);

module.exports = router;