const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const knex = require('../../utils/knex');
const moment = require('moment');

// delete refreshToken in cookie
router.delete('/', async (req, res) => {
    const { C4RFT } = req.cookies;
    const token = C4RFT;
    if (!token) {
        return res.status(401).end('cookie is not provided!');
    }

    // decode refresh-token
    const payload = jwt.decode(token);
    const { email } = payload;
    // is refresh-token match the one in db ?
    try {
        const rows = await knex.select()
            .from('users')
            .where('email', email);
        if (rows.length < 1) {
            throw new Error('invalid user!');
        }

        // clear refresh-token in db
        const user = rows[0];
        if (token === user.refresh_token) {
            const update = await knex('users')
                .where('email', email)
                .update({
                    refresh_token: '',
                    modified_at: moment(Date.now()).format('YYYY-MM-DD')
                });
            // whatever db operation is success or not, just clear cookie
        }

        // clear cookie (whatever still valid or not)
        const cookieOptions = {
            domain: process.env.COOKIE_DOMAIN
        };

        return res
            .clearCookie('C4RFT', cookieOptions)
            .sendStatus(204);

    } catch (error) {
        return res.status(403).end(error.message);
    }
});

module.exports = router;