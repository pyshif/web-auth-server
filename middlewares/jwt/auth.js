const jwt = require('jsonwebtoken');
const { verifyAccessTokenCallback } = require('../../utils/jwt/token');

function authenticateAccessToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    // async
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

async function authenticateRefreshToken(req, res, next) {
    const { C4RFT } = req.cookies;
    const token = req.token = C4RFT; // req.token is for authenticateGoogleIDToken
    // console.log('token :>> ', token);

    if (!token) {
        return res.status(401).end('refresh-token isn\'t provide!');
    }
    // token iss ?
    const payload = jwt.decode(token);

    switch (payload.iss) {
        case process.env.JWT_REGULAR_TOKEN_ISS:
            // async
            const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
            jwt.verify(token, secret, (err, user) => {
                if (err) return res.status(403).end('refresh-token is invalid!');
                req.user = user;
                next();
            });
            break;
        case process.env.JWT_GOOGLE_TOKEN_ISS:
            await verifyGoogleIDToken(token, (err, user) => {
                if (err) return res.status(403).end('refresh-token is invalid!');
                req.user = user;
                next();
            });
            break;
        default:
            return res.status(403).end('unknown token iss!');
    }
}

const { OAuth2Client } = require('google-auth-library');
const googleAuthClient = new OAuth2Client(process.env.GOOGLE_SIGNIN_CLIENT_ID);
async function authenticateGoogleIDToken(req, res, next) {
    const token = req.headers['authorization'].split(' ').pop();
    // console.log('token :>> ', token);
    if (!token) return res.status(401).end('please supply valid google-token!');

    await verifyGoogleIDToken(token, (err, user) => {
        if (err) return res.status(401).end(err.message);
        req.user = {
            ...user,
            token,
        };
        next();
    });
}
// common function
async function verifyGoogleIDToken(token, callback) {
    try {
        const ticket = await googleAuthClient.verifyIdToken({
            idToken: token,
            audience: [process.env.GOOGLE_SIGNIN_CLIENT_ID]
        });
        callback(null, ticket.getPayload());
    } catch (error) {
        callback(error, null);
    }
}

// for ux_mode = redirect
// function verifyGoogleCSRF(req, res, next) {
//     const csrf_token_cookie = req.cookies['g_csrf_token'];
//     const csrf_token_body = req.body['g_csrf_token'];

//     if (!csrf_token_cookie) {
//         return res.status(400).send('No CSRF token in cookie.');
//     }
//     if (!csrf_token_body) {
//         return res.status(400).send('No CSRF token in body.');
//     }
//     if (csrf_token_cookie != csrf_token_body) {
//         return res.status(400).send('Failed to verify double submit cookie.');
//     }

//     next();
// }

// for ux_mode = redirect
// async function verifyGoogleIDToken(req, res, next) {
//     const token = req.body['credential'];
//     const clientId = req.body['clientId'];

//     try {
//         const ticket = await client.verifyIdToken({
//             idToken: token,
//             audience: [process.env.GOOGLE_SIGNIN_CLIENT_ID]
//         });

//         const user = ticket.getPayload();
//         const userID = user['sub'];

//         console.log('google user :>> ', user);
//         console.log('google userID :>> ', userID);

//         if (user.aud != clientId) {
//             throw new Error;
//         }


//         req.user = user;
//         req.useID = userID;

//         next();
//     } catch (err) {
//         console.log('err :>>', err);
//         return res.sendStatus(400);
//     }
// }


module.exports = {
    authenticateAccessToken,
    authenticateRefreshToken,
    authenticateGoogleIDToken
};