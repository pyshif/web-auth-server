const express = require('express');
const router = express.Router();
const { authenticateGoogleIDToken } = require('../../middlewares/jwt/auth');
const { generateAccessToken } = require('../../utils/jwt/token');
const { sendWelcomeEmail } = require('../../utils/aws/ses');
const knex = require('../../utils/knex');
const moment = require('moment');

router.post('/popup',
    authenticateGoogleIDToken,
    async (req, res) => {
        try {
            const { user } = req; // user data is come from google id token
            let userDB = await selectUser(user); // userDB data is come from database
            // console.log('userDB :>> ', userDB);

            // db
            if (userDB) {
                // update
                if (!await updateUser(user)) throw new Error('update user failed!');
            }
            else {
                // create
                if (!await createUser(user)) throw new Error('create user failed!');
                userDB = await selectUser(user);
                // console.log('userDB :>> ', userDB);
                // console.log('user :>> ', user);
                const response = await sendWelcomeEmail(user.email);
                if (response instanceof Error) throw new Error('send welcome email failed!');
            }

            // access token
            const formatBirthday = !userDB.birthday ? '' : moment(userDB.birthday).format('YYYY-MM-DD');
            const accessToken = generateAccessToken({
                name: user.name,
                email: user.email,
                phone: userDB.phone,
                gender: userDB.gender,
                birthday: formatBirthday,
                avatar: user.picture,
            });
            // OK
            const cookieOptions = {
                domain: process.env.COOKIE_DOMAIN,
                secure: process.env.COOKIE_SECURE === 'true',
                httpOnly: process.env.COOKIE_HTTPONLY === 'true'
            }
            return res
                .cookie('C4RFT', user.token, cookieOptions)
                .json({ accessToken });

        } catch (error) {
            return res.status(403).end(error.message);
        }
    }
);

// common function
async function selectUser(user) {
    try {
        const rows = await knex.select()
            .from('users')
            .where('email', user.email);
        if (rows.length < 1) {
            throw new Error('unknown user!');
        }

        return rows[0];
    } catch (error) {
        return null;
    }
}

async function createUser(user) {
    try {
        const insert = await knex('users')
            .insert({
                name: user.name,
                email: user.email,
                avatar: user.picture,
                user_status_id: 2,
                refresh_token: user.token,
            });
        if (insert.length < 1) {
            throw new Error('creating user is failed!');
        }
        return true;
    } catch (error) {
        // console.log('error.message :>> ', error.message);
        return false;
    }
}

async function updateUser(user) {
    try {
        const update = await knex('users')
            .where('email', user.email)
            .update({
                name: user.name,
                avatar: user.picture,
                refresh_token: user.token
            });
        if (update < 1) {
            throw new Error('update user failed!');
        }
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = router;