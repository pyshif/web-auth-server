const express = require('express');
const router = express.Router();
const { default: validator } = require('validator');
const bcrypt = require('bcrypt');
const moment = require('moment');
const knex = require('../../utils/knex');
const { sendValidationEmail } = require('../../utils/aws/ses');
const { generateLinkTokenCallback, verifyLinkToken } = require('../../utils/jwt/token');

router.post('/', validateSignUpPayload, async (req, res) => {
    const { user } = req; // pass from prev middleware

    // has registerd ?
    try {
        const rows = await knex.select()
            .from('users')
            .where('email', user.email);
        if (rows.length > 0) {
            throw new Error('email has been registerd!');
        }
    } catch (error) {
        return res.status(403).end(error.message);
    }
    // hash and store into db 
    const hashPassword = await bcrypt.hash(user.password, 10);
    const hashPasswordHint = await bcrypt.hash(user.passwordHint, 10);
    // console.log('hashPassword :>> ', hashPassword);
    // console.log('hashPasswordHint :>> ', hashPasswordHint);
    try {
        const insert = await knex('users')
            .insert({
                name: user.name,
                email: user.email,
                password: hashPassword,
                password_hint: hashPasswordHint,
                user_status_id: 1, // pending: wait for validate email address
                modified_at: moment(Date.now()).format('YYYY-MM-DD'),
                created_at: moment(Date.now()).format('YYYY-MM-DD')
            });
        if (insert.length < 1) {
            throw new Error('creating user data is failed!');
        }
    } catch (error) {
        return res.status(403).end(error.message);
    }
    // send validation email to user
    const payload = { email: user.email };
    generateLinkTokenCallback(payload, async (err, token) => {
        if (err) return res.status(403).end('generating email validation token is falied!');
        // console.log('token :>> ', token);
        const url = process.env.SERVER_EMAIL_VALIDATION_BASEURL + token;
        const response = await sendValidationEmail(user.email, url);
        if (response instanceof Error) {
            return res.status(400).end('sending validation email is failed!');
        }
        // OK
        return res.status(200).end();
    });
});

router.get('/:token', async function (req, res) {
    const { token } = req.params;

    // verify token
    let payload;
    try {
        payload = verifyLinkToken(token);
        // console.log('payload :>> ', payload);
    } catch (error) {
        return res.status(403).end('invalid token!');
    }
    // has already pass ? 
    try {
        const rows = await knex.select()
            .from('users')
            .where('email', payload.email);
        if (rows.length < 0) {
            throw new Error('user doesn\'t exist!');
        }
        const user = rows[0];
        if (user.user_status_id != 1) {
            // return res.status(403).end('email address has already validated!');
            return res.redirect(process.env.CLIENT_BASEURL + 'auth/signin/');
        }
    } catch (error) {
        return res.status(403).end(error.message);
    }
    // complete sign up
    try {
        const update = await knex('users')
            .where('email', payload.email)
            .update('user_status_id', 2); // 2: fulfilled
        // console.log('update :>> ', update);
        if (update < 1) {
            throw new Error('validating email address is failed!');
        }
        return res.redirect(process.env.CLIENT_BASEURL + 'auth/signin/');
    } catch (error) {
        return res.status(403).end(error.message);
    }
});

// validate middleware
function validateSignUpPayload(req, res, next) {
    const { name,
        email,
        password,
        confirmPassword,
        passwordHint } = req.body;

    const rules = {
        name: {
            length: {
                min: 1,
                max: 30
            }
        },
        password: {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d])(?=.*[!@#$%&*?])[a-zA-Z\d!@#$%&*?]{8,25}$/g,
        },
        passwordHint: {
            pattern: /^[a-zA-Z\d\s]{6,25}$/g,
        }

    }

    if (!name || !email || !password || !confirmPassword) {
        return res.status(401).end('data missing!');
    }

    if (!validator.isLength(name, rules.name.length)) {
        return res.status(401).end('name format uncorrect!');
    }

    if (!validator.isEmail(email)) {
        return res.status(401).end('email format uncorrect!');
    }

    if (!validator.matches(password, rules.password.pattern)) {
        return res.status(401).end('password format uncorrect!');
    }

    if (!validator.equals(password, confirmPassword)) {
        return res.status(401).end('password and confirmPassword aren\'t equal!');
    }

    if (!validator.matches(passwordHint, rules.passwordHint.pattern)) {
        return res.status(401).end('passwordHint format uncorrect!');
    }
    // pass
    req.user = {
        name,
        email,
        password,
        passwordHint,
    }
    next();
}

module.exports = router;