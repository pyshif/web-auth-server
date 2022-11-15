const express = require('express');
const router = express.Router();
const { default: validator } = require('validator');
const { sendResetPasswordLinkEmail } = require('../../utils/aws/ses');
const knex = require('../../utils/knex');
const bcrypt = require('bcrypt');
const { generateLinkTokenCallback, verifyLinkTokenCallback } = require('../../utils/jwt/token');

router.post('/', validateForgotPayload, async (req, res) => {
    const { email, passwordHint } = req.forgot;

    // is user existed ?
    try {
        const rows = await knex.select()
            .from('users')
            .where('email', email);
        if (rows.length < 1) {
            throw new Error('invalid user!');
        }
        // compare hash password hint
        const user = rows[0];
        if (!user.password_hint) {
            return res.status(403).end('invalid password hint!');
        }
        if (!await bcrypt.compare(passwordHint, user.password_hint)) {
            throw new Error('invalid password hint!');
        }
        // send reset password link to user's email
        const payload = { email: user.email };
        generateLinkTokenCallback(payload, async (err, token) => {
            if (err) return res.status(403).end('invalid link token!');
            // console.log('token :>> ', token);
            const url = process.env.CLIENT_PASSWORD_RESETTING_BASEURL + token;
            const response = await sendResetPasswordLinkEmail(user.email, url);
            if (response instanceof Error) {
                return res.status(403).end();
            }

            if (process.env.MODE === 'dev') return res.status(200).json({ linkToken: token })
            return res.sendStatus(200);
        });

    } catch (error) {
        return res.status(403).end(error.message);
    }
});


router.post('/:token', validateForgotTokenPayload, async (req, res) => {
    const { token, password } = req.forgot;
    // console.log('token :>> ', token);
    // console.log('password :>> ', password);

    // verify token
    verifyLinkTokenCallback(token, async (err, user) => {
        if (err) return res.status(403).end('invalid token!');

        try {
            // store hash password into db
            const hashPassword = await bcrypt.hash(password, 10);
            const update = await knex('users')
                .where('email', user.email)
                .update('password', hashPassword);
            if (update < 1) {
                throw new Error('resetting password is failed!');
            }
            return res.sendStatus(200);

        } catch (error) {
            return res.status(403).end(error.message);
        }

    });
});

// middleware
function validateForgotPayload(req, res, next) {
    const { email, passwordHint } = req.body;

    if (!validator.isEmail(email)) {
        return res.status(401).end('invalid email format!');
    }

    if (!passwordHint) {
        return res.status(401).end('invalid password hint!');
    }

    req.forgot = {
        email,
        passwordHint
    };
    next();
}

function validateForgotTokenPayload(req, res, next) {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!token) {
        return res.status(401).end('invalid token params!');
    }

    const rules = {
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d])(?=.*[!@#$%&*?])[a-zA-Z\d!@#$%&*?]{8,25}$/g,
    }
    if (!validator.matches(newPassword, rules.pattern)) {
        return res.status(401).end('invalid password format!');
    }
    if (!validator.equals(newPassword, confirmPassword)) {
        return res.status(401).end('password and confirm-password are not equal!');
    }

    req.forgot = {
        token,
        password: newPassword,
    };
    next();
}

module.exports = router;