const express = require('express');
const router = express.Router();
const knex = require('../../utils/knex');
const moment = require('moment');
const { authenticateAccessToken, authenticateRefreshToken } = require('../../middlewares/jwt/auth');
const { generateAccessToken } = require('../../utils/jwt/token');

// authenticate access-token
router.get('/', authenticateAccessToken, (req, res) => {
    return res.status(200).end();
});

// refresh access-token by refresh-token
router.get('/new', authenticateRefreshToken, async (req, res) => {
    const { user, token } = req; // pass from prev middleware
    // console.log('user :>> ', user);
    // console.log('token :>> ', token);

    try {
        // confirm refresh-token is same with the database
        const rows = await knex.select()
            .from('users')
            .where({
                email: user.email,
                refresh_token: token
            });
        if (rows.length < 1) {
            throw new Error('refresh-token is uncorrect!');
        }
        // generate new access-token
        data = rows[0];
        const formatBirthday = !data.birthday ? '' : moment(data.birthday).format('YYYY-MM-DD');
        const newAccessToken = generateAccessToken({
            name: data.name,
            email: data.email,
            phone: data.phone,
            gender: data.gender,
            birthday: formatBirthday,
            avatar: data.avatar
        });

        return res.json({
            accessToken: newAccessToken
        });
    } catch (error) {
        return res.status(403).end(error.message);
    }
});


module.exports = router;