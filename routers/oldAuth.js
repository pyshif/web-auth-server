// standard
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
// third-part
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('../utils/knex');
const moment = require('moment');
const { default: validator } = require('validator');
const AWS = require('aws-sdk');
const multer = require('multer');
const { Base64 } = require('js-base64');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_SIGNIN_CLIENT_ID);

// health
// router.use('/health', function (req, res) {
//     const cookieOptions = {
//         domain: process.env.COOKIE_DOMAIN,
//         secure: process.env.COOKIE_SECURE === 'true' ? true : false,
//         httpOnly: process.env.COOKIE_HTTPONLY === 'true' ? true : false,
//     };

//     return res
//         .cookie('health', 'OK', cookieOptions)
//         .sendStatus(200);
// });

// auth
// check access token validation (one user one time)
// router.get('/', authenticateRegularToken, async function (req, res) {
//     const { user } = req;
//     const { refresh_token } = req.cookies;
//     // check user profile in db
//     try {
//         const rows = await knex.select()
//             .from('users')
//             .where({
//                 email: user.email,
//                 refresh_token: refresh_token
//             });

//         console.log('rows :>> ', rows);
//         if (rows.length == 0) {
//             throw new Error;
//         }

//         return res.sendStatus(200);

//     } catch (err) {
//         console.log('error :>>', err);
//         return res.sendStatus(403);
//     }
// });

// sign up
// router.post('/signup', async function (req, res) {
//     const { name, email, password, confirmPassword, passwordHint } = req.body;

//     // validate
//     if (!name || !email || !password || !confirmPassword) {
//         return res.sendStatus(401);
//         // return res.status(401).send({ message: '註冊資料格式錯誤' });
//     }
//     if (!validator.isLength(name, { min: 1 })) {
//         return res.sendStatus(401);
//         // return res.status(401).send({ message: '註冊資料格式錯誤' });
//     }
//     if (!validator.isEmail(email)) {
//         return res.sendStatus(401);
//         // return res.status(401).send({ message: '註冊資料格式錯誤' });
//     }
//     if (!validator.isLength(password, { min: 8, max: 30 }) ||
//         !validator.equals(password, confirmPassword)) {
//         return res.sendStatus(401);
//         // return res.status(401).send({ message: '註冊資料格式錯誤' });
//     }
//     if (!validator.isLength(passwordHint, { min: 0, max: 10 })) {
//         return res.sendStatus(401);
//         // return res.status(401).send({ message: '註冊資料格式錯誤' });
//     }
//     // is existed in db ?
//     try {
//         const rows = await knex.select()
//             .from('users')
//             .where('email', email);
//         // already register
//         if (rows.length > 0) {
//             return res.sendStatus(403);
//             // return res.status(403).send({ message: '此 Email 已註冊過' });
//         }
//     } catch (err) {
//         console.log('error :>>', err);
//         return res.sendStatus(403);
//     }

//     // hash
//     const hash_password = await bcrypt.hash(password, 10);
//     const hash_passwordHint = await bcrypt.hash(passwordHint, 10);
//     console.log('hash_password.length :>> ', hash_password.length);
//     console.log('hash_passwordHint.length :>> ', hash_passwordHint.length);

//     // store to db
//     try {
//         const insert = await knex('users')
//             .insert({
//                 name: name,
//                 email: email,
//                 password: hash_password,
//                 password_hint: hash_passwordHint,
//                 user_status_id: 1, // pending
//                 modified_at: moment(Date.now()).format('YYYY-MM-DD'),
//                 created_at: moment(Date.now()).format('YYYY-MM-DD'),
//             });
//         // console.log('insert :>> ', insert);
//         if (insert.length < 1) {
//             throw new Error;
//             // return res.status(403).send({ message: '伺服器繁忙，請稍後再試' });
//         }

//     } catch (err) {
//         console.log('error :>>', err);
//         return res.sendStatus(403);
//     }

//     // email verify
//     // const user = JSON.stringify({ email: account });
//     const user = { email };
//     const token = jwt.sign(user, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
//     const url = process.env.SERVER_EMAIL_VALIDATION_BASEURL + token;
//     // send email
//     const result = await sendVerifyEmail(email, url);
//     if (result instanceof Error) {
//         return res.sendStatus(400);
//     }
//     console.log('result :>> ', result);
//     // success
//     return res.sendStatus(200);
// });

// router.get('/signup/:token', async function (req, res) {
//     // const { base64 } = req.params;
//     // console.log('base64 :>> ', base64);
//     const { token } = req.params;

//     // console.log('validator.isBase64(base64) :>> ', validator.isBase64(base64));
//     // if (!validator.isBase64(base64)) {
//     //     return res.sendStatus(401);
//     // }
//     let user;
//     try {
//         user = await jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
//         console.log('user :>> ', user);
//     } catch (err) {
//         console.log('error :>>', err);
//         return res.sendStatus(403);
//     }

//     // const { email } = JSON.parse(Base64.decode(base64));
//     const { email } = user;
//     if (!validator.isEmail(email)) {
//         return res.sendStatus(403);
//     }

//     // update db
//     try {
//         const update = await knex('users')
//             .where('email', email)
//             .update('user_status_id', 2); // 2: fulfiiled
//         console.log('update :>> ', update);
//         if (update < 1) {
//             return res.sendStatus(403);
//         }

//         return res.sendStatus(200);
//         // redirect to frontend sign in pages
//     } catch (err) {
//         console.log('error :>>', err);
//     }

// });


// token
// FIXME: How to fix user frequently request new access token?
// 1. get refresh token from cookies
// 2. decode refresh token and confirm who is issuer
// 3. verify refresh token according by issuer
// 4. return new access token when validation pass.
// router.get('/token', async function (req, res) {
//     // check arg validation
//     // const { token } = req.body;
//     const { refresh_token } = req.cookies;
//     // console.log('refresh_token :>> ', refresh_token);

//     if (!refresh_token) {
//         return res.sendStatus(401);
//     }

//     // decode token
//     const payload = jwt.decode(refresh_token);
//     // console.log('payload :>> ', payload);

//     switch (payload.iss) {
//         case process.env.JWT_REGULAR_TOKEN_ISS:
//             verifyRegularRefreshToken();
//             break;
//         case process.env.JWT_GOOGLE_TOKEN_ISS:
//             verifyGoogleRefreshToken();
//             break
//         default:
//             return res.sendStatus(403);
//     }

//     // inner function
//     function verifyRegularRefreshToken() {
//         jwt.verify(refresh_token, process.env.JWT_REFRESH_TOKEN_SECRET, async (err, payload) => {
//             if (err) return res.sendStatus(403);

//             try {

//                 const rows = await knex.select()
//                     .from('users')
//                     .where('email', payload.email);

//                 if (rows.length == 0) {
//                     throw new Error;
//                 }
//                 const user = rows[0];
//                 // console.log('row.refresh_token :>> ', row.refresh_token);
//                 if (user.refresh_token != refresh_token) {
//                     throw new Error;
//                 }

//                 // update modified at
//                 const update = await knex('users')
//                     .where('email', payload.email)
//                     .update('modified_at', moment(Date.now()).format('YYYY-MM-DD'));

//                 if (update < 1) {
//                     return res.sendStatus(403);
//                 }

//                 // return new access token
//                 return res.json({
//                     access_token: generateRegularAccessToken({
//                         name: user.name,
//                         email: user.email,
//                         phone: user.phone,
//                         birthday: moment(user.birthday).format('YYYY-MM-DD'),
//                         avatar: user.avatar
//                     })
//                 });

//             } catch (err) {
//                 console.log('err :>> ', err);
//                 return res.sendStatus(403);
//             }
//         });
//     }

//     async function verifyGoogleRefreshToken() {
//         try {
//             const ticket = await client.verifyIdToken({
//                 idToken: refresh_token,
//                 audience: [process.env.GOOGLE_SIGNIN_CLIENT_ID]
//             });
//             // console.log('ticket :>> ', ticket);
//             const gUser = ticket.getPayload();

//             const rows = await knex.select()
//                 .from('users')
//                 .where('email', gUser.email);

//             if (rows.length < 1) {
//                 throw new Error();
//             }

//             const user = rows[0];

//             // update modified at
//             const update = await knew('users')
//                 .where('email', user.email)
//                 .update('modified_at', moment(Date.now()).format('YYYY-MM-DD'));
//             if (update < 1) {
//                 return res.sendStatus(403);
//             }

//             return res.json({
//                 access_token: generateRegularAccessToken({
//                     name: user.name,
//                     email: user.email,
//                     phone: user.phone,
//                     birthday: moment(user.birthday).format('YYYY-MM-DD'),
//                     avatar: user.avatar,
//                 })
//             })
//         } catch (err) {
//             console.log('err :>>', err);
//             return res.sendStatus(403);
//         }
//     }
// });


// sign in
// -> verify email and password (argon2)
// -> generate access_token and refresh_token
// -> update refresh_token on user of database
// -> response
// router.post('/signin', async function (req, res) {
//     const { email, password } = req.body;
//     // console.log('email :>> ', email);
//     // console.log('password :>> ', password);
//     if (!email || !password) {
//         return res.sendStatus(401);
//     }

//     // is existed in database
//     try {
//         const rows = await knex.select()
//             .from('users')
//             .where('email', email);

//         if (rows.length == 0) {
//             throw new Error;
//             // return res.status(403).send({ message: '帳號 or 密碼錯誤' });
//         }

//         const user = rows[0];

//         // unverify email
//         console.log('user.user_status_id :>> ', user.user_status_id);
//         if (user.user_status_id !== 2 || user.user_status_id !== 5) { // 2: fulfilled, 5: changing
//             return res.sendStatus(403);
//         }

//         // confirm password
//         if (!await bcrypt.compare(password, user.password)) {
//             return res.sendStatus(403);
//         }

//         // generate token
//         const access_token = generateRegularAccessToken({
//             name: user.name,
//             email: user.email,
//             phone: user.phone,
//             birthday: moment(user.birthday).format('YYYY-MM-DD'),
//             avatar: user.avatar
//         });
//         const refresh_token = generateRegularRefreshToken({ name: user.name, email: user.email });
//         // console.log('refresh_token.length :>> ', refresh_token.length);
//         // write token
//         const update_result = await knex('users')
//             .where('email', user.email)
//             .update({
//                 refresh_token: refresh_token,
//                 modified_at: moment(Date.now()).format('YYYY-MM-DD')
//             });
//         if (update_result < 1) {
//             throw new Error;
//         }

//         // set refresh_token to cookie with http-only
//         // set access_token to in-memory

//         return res
//             .cookie('refresh_token', refresh_token, { domain: process.env.COOKIE_DOMAIN, httpOnly: process.env.COOKIE_HTTPONLY === 'true', secure: process.env.COOKIE_SECURE === 'true' })
//             .json({ access_token });


//     } catch (err) {
//         console.log('err :>> ', err);
//         return res.sendStatus(403);
//     }

// });

// sign out
// -> remove user's refresh_token in database
// -> response
// router.delete('/signout', authenticateRegularToken, async function (req, res) {
//     // const { email } = req.body;
//     // const { refresh_token } = req.cookies;
//     const { user } = req;

//     // if (!refresh_token) {
//     //     return res.sendStatus(401);
//     // }

//     try {
//         const update = await knex('users')
//             .where('email', user.email)
//             .update({
//                 refresh_token: ''
//             });
//         console.log('update :>> ', update);

//         if (update != 1) {
//             throw new Error;
//         }
//         // expired access token ?

//         return res
//             .clearCookie('refresh_token', { domain: process.env.COOKIE_DOMAIN })
//             .sendStatus(204);
//     } catch (err) {
//         console.log('error :>>', err);
//         return res.sendStatus(403);
//     }
// });

// forgot password
// router.post('/forgot', async function (req, res) {
//     const { email, passwordHint } = req.body;

//     if (!validator.isEmail(email) || passwordHint === undefined) {
//         return res.sendStatus(401);
//     }

//     // is existed in db
//     try {
//         const rows = await knex.select()
//             .from('users')
//             .where('email', email);

//         // already register
//         if (rows.length < 1) {
//             return res.sendStatus(403);
//         }

//         // verify
//         const user = rows[0];
//         if (user.password_hint !== null && await bcrypt.compare(passwordHint, user.password_hint)) {
//             const token = jwt.sign({ email: user.email }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
//             const url = process.env.CLIENT_PASSWORD_RESETTING_BASEURL + token;
//             const result = await sendForgotPasswordEmail(user.email, url);

//             if (result instanceof Error) {
//                 return res.sendStatus(403);
//             }

//             console.log('result :>> ', result);
//             return res.sendStatus(200);
//         } else {
//             return res.sendStatus(403);
//         }
//     } catch (err) {
//         console.log('error :>>', err);
//     }

// });

// reset user password by link (expire 30mins )
// router.post('/forgot/:token', async function (req, res) {
//     const { token } = req.params;
//     const { newPassword, confirmPassword } = req.body;

//     let user;
//     try {
//         user = await jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
//         console.log('user :>> ', user);
//     } catch (err) {
//         console.log('error :>> ', err);
//         return res.sendStatus(403);
//     }

//     try {
//         const rows = await knex.select()
//             .from('users')
//             .where('email', user.email);

//         if (rows.length < 1) {
//             throw new Error;
//         }

//         if (!validator.isLength(newPassword, { min: 8, max: 30 }) ||
//             !validator.equals(newPassword, confirmPassword)) {
//             throw new Error;
//         }

//         const hashPassword = await bcrypt.hash(newPassword, 10);
//         console.log('hashPassword.length :>> ', hashPassword.length);

//         const update = await knex('users')
//             .where('email', user.email)
//             .update('password', hashPassword);

//         if (update < 1) {
//             throw new Error;
//         }

//         return res.sendStatus(200);

//     } catch (err) {
//         console.log('error :>>', err);
//         return res.sendStatus(403);
//     }
// });

// reset password
// router.post('/reset', authenticateRegularToken, async function (req, res) {
//     const { password, confirmPassword } = req.body;
//     const { user } = req;

//     if (!validator.isLength(password, { min: 8, max: 30 }) ||
//         !validator.equals(password, confirmPassword)) {
//         return res.sendStatus(401);
//     }

//     try {
//         const hashPassword = await bcrypt.hash(password, 10);
//         console.log('hashPassword :>> ', hashPassword);
//         const update = await knex('users')
//             .where('email', user.email)
//             .update('password', hashPassword);

//         console.log('update :>> ', update);
//         if (update < 1) {
//             throw new Error;
//         }

//         return res.sendStatus(200);
//     } catch (err) {
//         console.log('err :>>', err);
//         return res.sendStatus(403);
//     }
// });

// edit personal info
// router.post('/user/info', authenticateRegularToken, async function (req, res) {
//     const { name, birthday, phone } = req.body;
//     const { user } = req;
//     const query = {};

//     if (!name && !birthday && !phone) {
//         return res.sendStatus(401);
//     }

//     if (name != '') {
//         if (!validator.isLength(name, { min: 1 })) {
//             return res.sendStatus(403);
//         }
//         query['name'] = name;
//     }


//     if (birthday != '') {
//         if (!validator.isDate(birthday, { format: 'YYYY-MM-DD' })) {
//             return res.sendStatus(403);
//         }
//         query['birthday'] = birthday;
//     }

//     if (phone != '') {
//         if (!validator.isMobilePhone(phone)) {
//             return res.sendStatus(403);
//         }
//         query['phone'] = phone;
//     }

//     console.log('query :>> ', query);

//     try {
//         const update = await knex('users')
//             .where('email', user.email)
//             .update(query);

//         console.log('update :>> ', update);
//         if (update < 1) {
//             return res.sendStatus(403);
//         }

//         return res.sendStatus(200);
//     } catch (err) {
//         console.log('err :>> ', err);
//         return res.sendStatus(403);
//     }
// });

// edit email
// router.post('/user/email', authenticateRegularToken, async function (req, res) {
//     const { email } = req.body;
//     const { user } = req;
//     const payload = {
//         oldEmail: '',
//         newEamil: ''
//     };

//     if (!email || !validator.isEmail(email)) {
//         return res.sendStatus(401);
//     }

//     // check user validation
//     try {
//         const rows = await knex.select()
//             .from('users')
//             .where('email', user.email);

//         if (rows.length < 1) {
//             throw new Error;
//         }

//         payload.oldEmail = rows[0].email;

//     } catch (err) {
//         console.log('err :>>', err);
//         return res.sendStatus(403);
//     }
//     // check new-email validation
//     try {
//         const rows = await knex.select()
//             .from('users')
//             .where('email', email);

//         if (rows.length > 0) {
//             throw new Error;
//         }

//         payload.newEmail = email;

//         const token = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
//         const url = process.env.SERVER_EMAIL_VALIDATION_FOR_CHANGING_BASEURL + token;

//         const sent = await sendVerifyEmail(email, url);
//         console.log('sent :>> ', sent);

//         const update = await knex('users')
//             .where('email', user.email)
//             .update({
//                 user_status_id: 5 // 5: changing
//             });
//         console.log('update :>> ', update);
//         if (update < 1) {
//             throw new Error;
//         }

//         return res.sendStatus(200);
//     } catch (err) {
//         console.log('err :>>', err);
//         return res.sendStatus(403);
//     }
// });

// edit email : handle verify mail address
// router.get('/user/email/:token', async function (req, res) {
//     const { token } = req.params;

//     try {
//         const { oldEmail, newEmail } = await jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
//         console.log('oldEmail :>> ', oldEmail);
//         console.log('newEmail :>> ', newEmail);

//         const update = await knex('users')
//             .where('email', oldEmail)
//             .update({
//                 email: newEmail,
//                 user_status_id: 2  // 2: fulfilled
//             })

//         console.log('update :>> ', update);
//         if (update < 1) {
//             throw new Error;
//         }

//         return res.sendStatus(200);
//     } catch (err) {
//         console.log('err :>>', err);
//         return res.sendStatus(403);
//     }
// });

// edit avatar
// const storageAvatar = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const id = Base64.encode(req.user.email);
//         const dir = path.join(__dirname, '../public/uploads/profile', id);
//         if (!fs.existsSync(dir)) fs.mkdirSync(dir);
//         req.avatarUrl = process.env.SERVER_BASEURL + 'uploads/profile/' + id;
//         cb(null, dir);
//     },
//     filename: function (req, file, cb) {
//         const ext = file.originalname.split('.').pop();
//         const id = Base64.encode(req.user.email);
//         req.avatarUrl += '/' + id + '.' + ext;
//         cb(null, id + '.' + ext);
//     },
// });

// const uploadAvatar = multer({
//     storage: storageAvatar,
//     fileFilter: function (req, file, cb) {
//         if (file.mimetype !== 'image/jpeg'
//             && file.mimetype !== 'image/jpg'
//             && file.mimetype !== 'image/png') {
//             cb(new Error, false);
//         }

//         cb(null, true);
//     },
//     limits: {
//         // 1 MB
//         fileSize: 1024 * 1024,
//     }
// });

// router.post('/user/avatar',
//     authenticateRegularToken,
//     function (req, res) {
//         uploadAvatar.single('avatar')(req, res, async function (err) {
//             if (err instanceof multer.MulterError) {
//                 console.log('multer err :>> ', err);
//                 return res.sendStatus(403);
//             }
//             else if (err) {
//                 console.log('err :>> ', err);
//                 return res.sendStatus(403);
//             }

//             // console.log('req.file :>> ', req.file);
//             // console.log('req.avatarUrl :>> ', req.avatarUrl);

//             // wirte to db
//             try {
//                 const { user } = req;
//                 const update = await knex('users')
//                     .where('email', user.email)
//                     .update('avatar', req.avatarUrl);

//                 if (update < 1) {
//                     throw new Error;
//                 }

//                 return res.sendStatus(200);
//             } catch (err) {
//                 console.log('err :>>', err);
//                 return res.sendStatus(403);
//             }
//         })
//     });

// google sign in (redirect mode)
// router.post('/google/signin',
//     verifyGoogleCSRF,
//     verifyGoogleIDToken,
//     function (req, res) {
//         const token = req.body['credential'];
//         const csrf = req.body['g_csrf_token'];
//         return res.redirect('http://localhost:3000/home').json({ access_token: token, g_csrf_token: csrf });
//     });

// google auth (redirect mode)
// router.post('/google/auth',
//     verifyGoogleCSRF,
//     verifyGoogleIDToken,
//     function (req, res) {
//         return res.sendStatus(200);
//     });

// google sign in (popup mode)
// 1. get access token (google) from frontend
// 2. store it to be refresh token in users database
// 3. generate access token (regular) for frontend 
// 4. return access token (regular) and refresh token (google) 
// router.post('/google/signin', authenticateGoogleIDToken, async function (req, res) {
//     const { user, token } = req;
//     // console.log('user :>> ', user);
//     // console.log('token :>> ', token);
//     // insert or update user information in database
//     try {
//         const rows = await knex.select()
//             .from('users')
//             .where('email', user.email);

//         // update user information
//         if (rows.length > 0) {
//             const update = await knex('users')
//                 .where('email', user.email)
//                 .update({
//                     name: user.name,
//                     avatar: user.picture,
//                     refresh_token: token,
//                 });

//             if (update < 1) {
//                 throw new Error;
//             }
//         }
//         // insert user information
//         else {
//             const insert = await knex('users')
//                 .insert({
//                     name: user.name,
//                     account: user.email,
//                     email: user.email,
//                     avatar: user.picture,
//                     registered: 2,
//                     refresh_token: token,
//                 });

//             if (insert.length < 1) {
//                 throw new Error;
//             }
//         }


//     } catch (err) {
//         console.log('err :>>', err);
//         return res.sendStatus(403);
//     }

//     try {
//         const rows = await knex.select()
//             .from('users')
//             .where('email', user.email);

//         const row = rows[0];
//         // generate access token (regular)
//         const access_token = generateRegularAccessToken({
//             name: row.name,
//             email: row.email,
//             phone: row.phone,
//             birthday: moment(row.birthday).format('YYYY-MM-DD'),
//             avatar: row.avatar
//         });

//         return res
//             .cookie('refresh_token', token, { domain: process.env.COOKIE_DOMAIN, httpOnly: process.env.COOKIE_HTTPONLY === 'true', secure: process.env.COOKIE_SECURE === 'true' })
//             .json({ access_token });
//     } catch (err) {
//         console.log('err :>>', err);
//     }


// })


// TODO: Half OK
// async function sendVerifyEmail(to, url) {
//     // config credential and region from .json
//     AWS.config.loadFromPath(path.join(__dirname, '../config.json'));
//     // console.log('AWS.Endpoint :>> ', AWS.Endpoint);

//     // create sendEamil params
//     const params = {
//         Destination: {
//             ToAddresses: [
//                 to,
//             ]
//         },
//         Message: {
//             Body: {
//                 Html: {
//                     Charset: 'UTF-8',
//                     Data: `<h1>Confirm your email address.</h1>
//                         <p>Please click follow verification link to confirm your email in 30 min.</p>
//                         <a href="${url}">${url}</a>`
//                 },
//             },
//             Subject: {
//                 Charset: 'UTF-8',
//                 Data: 'Color4 Me'
//             }
//         },
//         Source: process.env.AWS_SES_SENDER,
//     };

// create the promise ann ses service object
// const ses = new AWS.SES({ apiVersion: '2010-12-01' });

// try {
//     const data = await ses.sendEmail(params).promise();

//     return data;

// } catch (err) {
//     console.log('error :>>', err);
//     return err;
// }
// }

// TODO: Half OK
// async function sendForgotPasswordEmail(to, url) {
//     // config credential and region
//     AWS.config.loadFromPath(path.join(__dirname, '../config.json'));


//     // create sendEmail params
//     const params = {
//         Destination: {
//             ToAddresses: [
//                 to,
//             ]
//         },
//         Message: {
//             Body: {
//                 Html: {
//                     Charset: 'UTF-8',
//                     Data: `<h1>Reset your password.</h1>
//                         <p>Please click follow link to reset your password in 30 min.
//                         <a href="${url}">${url}</a>`
//                 },
//             },
//             Subject: {
//                 Charset: 'UTF-8',
//                 Data: 'Color4 Me'
//             }
//         },
//         Source: process.env.AWS_SES_SENDER,
//     };

//     // create the promise and ses service object
//     const ses = new AWS.SES({ apiVersion: '2010-12-01' });

//     try {
//         const data = await ses.sendEmail(params).promise();

//         return data;
//     } catch (err) {
//         console.log('error :>>', err);
//         return err;
//     }
// }

module.exports = router;
