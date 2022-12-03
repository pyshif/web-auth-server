const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const { authenticateAccessToken } = require('../../middlewares/jwt/auth');
const { default: validator } = require('validator');
const { generateLinkTokenCallback, verifyLinkTokenCallback } = require('../../utils/jwt/token');
const { sendChangingEmail } = require('../../utils/aws/ses');
const multer = require('multer');
const { Base64 } = require('js-base64');
const knex = require('../../utils/knex');

router.delete('/',
    authenticateAccessToken,
    async (req, res) => {
        const { user } = req;

        try {
            const remove = await knex('users')
                .where('email', user.email)
                .del();
            // console.log('remove :>> ', remove);
            if (remove < 1) {
                throw new Error('deleting user is failed!');
            }
            // alter table auto increment
            const alter = await knex.schema.raw('ALTER TABLE users AUTO_INCREMENT = 1');
            // console.log('alter :>> ', alter);
            return res.sendStatus(200);

        } catch (error) {
            return res.status(403).end(error.message);
        }
    });

router.post('/name',
    authenticateAccessToken,
    validateUserNamePayload,
    async (req, res) => {
        const { user } = req;
        try {
            const update = await knex('users')
                .where('email', user.email)
                .update('name', user.newName);
            if (update < 1) {
                throw new Error('updating user\'s name is failed!');
            }
            return res.sendStatus(200);
        } catch (error) {
            return res.status(403).end(error.message);
        }
    });

router.post('/birthday',
    authenticateAccessToken,
    validateUserBirthdayPayload,
    async (req, res) => {
        const { user } = req;
        try {
            const update = await knex('users')
                .where('email', user.email)
                .update('birthday', user.newBirthday);
            if (update < 1) {
                throw new Error('updating user\'s birthday is failed!');
            }
            return res.sendStatus(200);
        } catch (error) {
            return res.status(403).end(error.message);
        }
    });

router.post('/phone',
    authenticateAccessToken,
    validateUserPhonePayload,
    async (req, res) => {
        const { user } = req;
        try {
            const update = await knex('users')
                .where('email', user.email)
                .update('phone', user.newPhone);
            if (update < 1) {
                throw new Error('udpating user\'s phone is failed!');
            }
            return res.sendStatus(200);
        } catch (error) {
            return res.status(403).end(error.message);
        }
    });

router.post('/gender',
    authenticateAccessToken,
    validateUserGenderPayload,
    async (req, res) => {
        const { user } = req;
        try {
            const update = await knex('users')
                .where('email', user.email)
                .update('gender', user.newGender);
            if (update < 1) {
                throw new Error('udpating user\'s gender is failed!');
            }
            return res.sendStatus(200);
        } catch (error) {
            return res.status(403).end(error.message);
        }
    }
);

router.post('/email',
    authenticateAccessToken,
    validateUserEmailPayload,
    async (req, res) => {
        const { user } = req;

        try {
            // is email existed ?
            const rows = await knex.select()
                .from('users')
                .where('email', user.newEmail);
            if (rows.length > 0) {
                throw new Error('new email has been registered!');
            }

            const payload = {
                oldEmail: user.email,
                newEmail: user.newEmail
            };

            generateLinkTokenCallback(payload, async (err, token) => {
                if (err) return res.status(403).end(err.message);
                const url = process.env.SERVER_EMAIL_VALIDATION_FOR_CHANGING_BASEURL + token;
                // send verify email
                const response = await sendChangingEmail(user.newEmail, url);
                if (response instanceof Error) {
                    return res.status(403).end('sending email validation is failed!');
                }
                // db
                const update = await knex('users')
                    .where('email', user.email)
                    .update({
                        user_status_id: 5 // 5: changing
                    });
                if (update < 1) {
                    throw new Error('updating user-status is failed!');
                }
                // OK
                return res.sendStatus(200);
            });

        } catch (error) {
            return res.status(403).end(error.message);
        }
    });

router.get('/email/:token',
    validateUserEmailTokenPayload,
    async (req, res) => {
        const { user } = req;

        try {
            const update = await knex('users')
                .where('email', user.oldEmail)
                .update({
                    email: user.newEmail,
                    refresh_token: '', // must clear refresh-token
                    user_status_id: 2 // fulfilled
                });
            if (update < 1) {
                throw new Error('updating user email is failed!');
            }
            return res.sendStatus(200);
        } catch (error) {
            return res.status(403).end(error.message);
        }
    });

const storageAvatar = multer.diskStorage({
    destination: (req, file, cb) => {
        const { user } = req;
        const url = 'uploads/user/';
        const dir = path.join(__dirname, '../../public', url);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        req.user.avatar = process.env.SERVER_BASEURL + url;
        // console.log('user :>> ', user);
        // console.log('dir :>> ', dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const { user } = req;
        // console.log('user :>> ', user);
        const ext = file.originalname.split('.').pop();
        // TODO: fix naming duplicate bug
        const id = Base64.encode(user.email + user.name);
        const filename = id + '.' + ext;
        req.user.avatar += filename;
        // console.log('filename :>> ', filename);
        cb(null, filename);
    },
})
const uploadAvatar = multer({
    storage: storageAvatar,
    fileFilter: (req, file, cb) => {
        // file {
        //     fieldname: 'avatar',
        //     originalname: 'avatar-example.jpg',
        //     encoding: '7bit',
        //     mimetype: 'image/jpeg'
        // }
        console.log('file :>> ', file);
        if (file.mimetype !== 'image/jpeg' &&
            file.mimetype !== 'image/png') {
            cb(new Error('avatar mimetype invalid!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 2 * 1024 * 1024,
    }
});

router.post('/avatar',
    authenticateAccessToken,
    (req, res) => {
        uploadAvatar.single('avatar')(req, res, async (err) => {
            if (err) return res.status(403).end(err.message);

            try {
                const { user } = req;
                const update = await knex('users')
                    .where('email', user.email)
                    .update('avatar', user.avatar);
                if (update < 1) {
                    throw new Error('updating user avatar is failed!');
                }

                return res.sendStatus(200);
            } catch (error) {
                return res.status(403).end(error.message);
            }
        });
    })

// middleware
function validateUserNamePayload(req, res, next) {
    const { name } = req.body;
    const { user } = req; // pass from prev middleware

    if (!name) {
        return res.status(401).end('please supply valid payload!');
    }
    req.user = {
        ...user,
        newName: name
    };
    next();
}

function validateUserBirthdayPayload(req, res, next) {
    const { birthday } = req.body;
    const { user } = req;

    if (!birthday ||
        !validator.isDate(birthday)) {
        return res.status(401).end('please supply valid birthday!');
    }
    req.user = {
        ...user,
        newBirthday: birthday,
    };
    next();
}

function validateUserPhonePayload(req, res, next) {
    const { phone } = req.body;
    const { user } = req;

    if (!phone ||
        !validator.isMobilePhone(phone)) {
        return res.status(401).end('please supply valid mobile phone!');
    }
    req.user = {
        ...user,
        newPhone: phone,
    };
    next();
}

function validateUserGenderPayload(req, res, next) {
    const { gender } = req.body;
    const { user } = req;

    if (!gender ||
        (!validator.equals(gender, 'male') &&
            !validator.equals(gender, 'female'))) {
        return res.status(401).end('please supply valid gender!');
    }
    req.user = {
        ...user,
        newGender: gender
    };
    next();
}

function validateUserEmailPayload(req, res, next) {
    const { email } = req.body;
    const { user } = req;

    if (!email ||
        !validator.isEmail(email)) {
        return res.status(401).end('please supply valid email!');
    }
    req.user = {
        ...user,
        newEmail: email,
    };
    next();
}

function validateUserEmailTokenPayload(req, res, next) {
    const { token } = req.params;

    verifyLinkTokenCallback(token, (err, decoded) => {
        if (err) return res.status(403).end(err.message);

        req.user = {
            oldEmail: decoded.oldEmail,
            newEmail: decoded.newEmail,
        };
        next();
    });
}

module.exports = router;