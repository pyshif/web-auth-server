const express = require('express');
const router = express.Router();
const { authenticateAccessToken } = require('../../middlewares/jwt/auth');
const { sendFeedbackEmail } = require('../../utils/aws/ses');

router.post('/',
    authenticateAccessToken,
    validateFeedback,
    async (req, res) => {
        const { feedback } = req.body;

        try {
            const response = sendFeedbackEmail(feedback);
            if (response instanceof Error) {
                throw new Error('send feedback email failed!');
            }
            return res.sendStatus(200);
        } catch (error) {
            return res.status(403).end(error.message);
        }
    });

function validateFeedback(req, res, next) {
    const { feedback } = req.body;
    // console.log('feedback :>> ', feedback);
    if (!feedback) {
        return res.status(401).end('invalid feedback content.');
    }

    next();
}


module.exports = router;