const express = require('express');
const router = express.Router();
const knex = require('../../utils/knex');
const bcrypt = require('bcrypt');
const moment = require('moment');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwt/token');

router.post('/', validateSignInPayload, async (req, res) => {
    const { email, password } = req.user;

    // select user
    try {
        const rows = await knex.select()
            .from('users')
            .where('email', email)
            .whereNotIn('user_status_id', [1, 3, 4]);
        if (rows.length < 1) {
            throw new Error('invalid user!');
        }
        // compare hash password
        const user = rows[0];
        if (!await bcrypt.compare(password, user.password)) {
            throw new Error('password is uncorrect!');
        }
        // generate refresh-token and store it into db
        const refreshToken = await makeRefreshToken(email);
        // generate access-token
        const accessToken = makeAccessToken(user);
        // OK
        if (!refreshToken || !accessToken) {
            throw new Error('generating token is failed!');
        }
        const cookieOptions = {
            domain: process.env.COOKIE_DOMAIN,
            secure: process.env.COOKIE_SECURE === 'true',
            httpOnly: process.env.COOKIE_HTTPONLY === 'true'
        };

        return res
            .cookie('C4RFT', refreshToken, cookieOptions)
            .json({ accessToken });

    } catch (error) {
        return res.status(403).end(error.message);
    }
});

// middleware
function validateSignInPayload(req, res, next) {
    const { email, password } = req.body;
    // console.log('req.body :>> ', req.body);
    if (!email || !password) {
        return res.status(401).end('sign-in payload miss!');
    }
    req.user = {
        email,
        password
    };
    next();
}
// common function
async function makeRefreshToken(email) {

    const refreshToken = generateRefreshToken({ email });

    try {
        const update = await knex('users')
            .where('email', email)
            .update({
                refresh_token: refreshToken,
                modified_at: moment(Date.now()).format('YYYY-MM-DD')
            });
        if (update < 1) {
            throw new Error;
        }
        return refreshToken;
    } catch (error) {
        return undefined;
    }
}

function makeAccessToken(user) {
    const { name, email, phone, gender, birthday, avatar } = user;

    const formatBirthday = !birthday ? '' : moment(birthday).format('YYYY-MM-DD');
    const accessToken = generateAccessToken({
        name: name,
        email: email,
        phone: phone,
        gender: gender,
        birthday: formatBirthday,
        avatar: avatar,
    });

    return accessToken;
}


module.exports = router;