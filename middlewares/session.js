// exports = module.export = {}
// express-session
// > https://www.npmjs.com/package/express-session
// session-file-store doc
// > https://www.npmjs.com/package/session-file-store

const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
// require('dotenv').config();

module.exports = session({
    store: new FileStore({
        path: path.join(__dirname, '../sessions'),
    }),

    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
});

// FileStore Options
// - path:
//      > The directory where the session files will be stored. Defaults to ./sessions
// - ttl:
//      > Session time to live in seconds. Defaults to 3600
// - retries:
//      > The number of retries to get session data from a session file. Defaults to 5
// - factor:
//      > The exponential factor to use for retry. Defaults to 1
// - minTimeout:
//      > The number of milliseconds before starting the first retry. Defaults to 50
// - maxTimeout:
//      > The maximum number of milliseconds between two retries. Defaults to 100
// - reapIntervalObject:
//      > [OUT] Contains intervalObject if reap was scheduled
// - reapInterval:
//      > Interval to clear expired sessions in seconds or -1 if do not need. Defaults to 1 hour
// - reapAsync:
//      > use distinct worker process for removing stale sessions. Defaults to false
// - reapSyncFallback:
//      > reap stale sessions synchronously if can not do it asynchronously. Default to false
// - logFn:
//      > log messages. Defaults to console.log
// - fallbackSessionFn:
//      > returns fallback session object after all failed retries. No defaults
// - encoding:
//      > Object-to-text text encoding. Can be null. Defaults to 'utf8'
// - encoder:
//      > Encoding function. Takes object, returns encoded data. Defaults to JSON.stringify
// - decoder:
//      > Decoding function. Takes encoded data, returns object. Defaults to JSON.parse
// - fileExtension:
//      > File extension of saved files. Defaults to '.json'
// - secret:
//      > Enables transparent encryption support conforming to OWASP's Session Management best practices.
// - crypto.algorithm:
//      > Defaults to aes-256-gcm but supports symmetric algorithms listed from crypto.getCiphers().
// - crypto.hashing:
//      > Defaults to sha512 but supports hashing algorithms listed from crypto.getHashes().
// - crypto.use_scrypt:
//      > Defaults to true. When not supported (node < 10.5) will fall back to the crypto.pbkdf2() key derivation function.

// Session Options

// return module.exports
