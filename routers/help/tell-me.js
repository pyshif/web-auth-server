const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const { feedback } = req.body;
    console.log('feedback :>> ', feedback);
    return res.status(200).end('api health check.');
});


module.exports = router;