const jwt = require('jsonwebtoken');

function generateToken(payload, secret, expiresIn) {
    return jwt.sign(payload, secret, { expiresIn, issuer: process.env.JWT_REGULAR_TOKEN_ISS })
}

function generateTokenCallback(payload, secret, expiresIn, callback) {
    jwt.sign(payload, secret, { expiresIn, issuer: process.env.JWT_REGULAR_TOKEN_ISS }, callback);
}

function generateAccessToken(payload) {
    return generateToken(payload, process.env.JWT_ACCESS_TOKEN_SECRET, process.env.JWT_ACCESS_TOKEN_EXPIRES_IN);
}

function generateAccessTokenCallback(payload, callback) {
    return generateTokenCallback(payload, process.env.JWT_ACCESS_TOKEN_SECRET, process.env.JWT_ACCESS_TOKEN_EXPIRES_IN, callback);
}

function generateRefreshToken(payload) {
    return generateToken(payload, process.env.JWT_REFRESH_TOKEN_SECRET, process.env.JWT_REFRESH_TOKEN_EXPIRES_IN);
}

function generateLinkTokenCallback(payload, callback) {
    generateTokenCallback(payload, process.env.JWT_LINK_TOKEN_SECRET, process.env.JWT_LINK_TOKEN_EXPIRES_IN, callback);
}

function verifyAccessToken(token) {
    // return payload
    return jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
}

function verifyRefreshToken(token) {
    // return payload
    return jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
}

function verifyLinkToken(token) {
    return jwt.verify(token, process.env.JWT_LINK_TOKEN_SECRET);
}

function verifyLinkTokenCallback(token, callback) {
    jwt.verify(token, process.env.JWT_LINK_TOKEN_SECRET, callback);
}

module.exports = {
    generateToken,
    generateTokenCallback,
    generateAccessToken,
    generateAccessTokenCallback,
    generateRefreshToken,
    generateLinkTokenCallback,
    verifyAccessToken,
    verifyRefreshToken,
    verifyLinkToken,
    verifyLinkTokenCallback
};