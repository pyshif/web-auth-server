const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
    const cookieOptions = {
        domain: process.env.COOKIE_DOMAIN,
        secure: process.env.COOKIE_SECURE === 'true',
        httpOnly: process.env.COOKIE_HTTPONLY === 'true'
    };

    return res
        .cookie('health', 'OK', cookieOptions)
        .status(200)
        .end('auth health is OK.');
});


// sign-up
const signUpRouter = require('./sign-up');
router.use('/signup', signUpRouter);

// sign-in
const signInRouter = require('./sign-in');
router.use('/signin', signInRouter);

// google
const googleRouter = require('./google');
router.use('/google', googleRouter);

// authenticate access token
const tokenRouter = require('./token');
router.use('/token', tokenRouter);

// sign-out
const signOutRouter = require('./sign-out');
router.use('/signout', signOutRouter);

// forgot
const forgotRouter = require('./forgot');
router.use('/forgot', forgotRouter);

// reset
const resetRouter = require('./reset');
router.use('/reset', resetRouter);

// user
const userRouter = require('./user');
router.use('/user', userRouter);

module.exports = router;