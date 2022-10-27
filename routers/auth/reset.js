const express = require('express');
const router = express.Router();
const { authenticateAccessToken } = require('../../middlewares/jwt/auth');
const { default: validator } = require('validator');
const bcrypt = require('bcrypt');
const knex = require('../../utils/knex');

router.post('/',
    authenticateAccessToken,
    validateResetPayload,
    async (req, res) => {
        const { user } = req;

        try {
            const hashPassword = await bcrypt.hash(user.newPassword, 10);
            // console.log('hashPassword :>> ', hashPassword);
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


// middleware
function validateResetPayload(req, res, next) {
    const { user } = req;
    const { newPassword, confirmPassword } = req.body;

    const rule = {
        password: {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d])(?=.*[!@#$%&*?])[a-zA-Z\d!@#$%&*?]{8,25}$/g,
        }
    };

    if (!newPassword || !confirmPassword) {
        return res.status(403).end('please supply correct payload!');
    }
    if (!validator.matches(newPassword, rule.password.pattern)) {
        return res.status(403).end('password format is uncorrect!');
    }
    if (!validator.equals(newPassword, confirmPassword)) {
        return res.status(403).end('password and confirm-password aren\'t equal!');
    }

    req.user = {
        ...req.user,
        newPassword,
    };
    next();
}

module.exports = router;