const AWS = require('aws-sdk');
const path = require('path');

async function sendEmail(to, htmlData, subject) {
    // config credential and region from json
    AWS.config.loadFromPath(path.join(__dirname, '../../config.json'));
    // console.log('AWS.Endpoint :>> ', AWS.Endpoint);
    const params = {
        Destination: {
            ToAddresses: [
                to,
            ]
        },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: htmlData
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
        },
        Source: process.env.AWS_SES_SENDER,
    };
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });
    try {
        const response = await ses.sendEmail(params).promise();
        return response;
    } catch (error) {
        console.log('error :>> ', error);
        return error;
    }
}

async function sendValidationEmail(to, url) {
    const subject = 'Email Validation - color4.me';
    const htmlData = `<h1>Confirm your email address.</h1>
        <p>Please click follow url-link to complete email address validation in ${process.env.JWT_LINK_TOKEN_EXPIRES_IN}.
        <div>
            <a href="${url}">${url}</a>
        </div>
        <br/>
        <p>Sincerely,</p>
        <p>color4 me</p>`;
    return await sendEmail(to, htmlData, subject);
}

async function sendResetPasswordLinkEmail(to, url) {
    const subject = "Reset Your Password - color4.me";
    const htmlData = `
        <h1>Reset your password.</h1>
        <p>Please click follow link to reset your password in 15-mins.</p>
        <div>
            <a href="${url}">${url}</a>
        </div>
        <br/>
        <p>Sincerely,</p>
        <p>color4 me</p>`;
    return await sendEmail(to, htmlData, subject);
}

async function sendChangingEmail(to, url) {
    const subject = 'Eamil Validation - color4.me';
    const htmlData = `<h1>Confirm your email address.</h1>
        <p>Please click follow url-link to complete email address validation in ${process.env.JWT_LINK_TOKEN_EXPIRES_IN}.
        <div>
            <a href="${url}">${url}</a>
        </div>
        <p>If you regret to change your email address, just ignore the above link!</p>
        <br/>
        <p>Sincerely,</p>
        <p>color4 me</p>`;
    return await sendEmail(to, htmlData, subject);
}

async function sendWelcomeEmail(to) {
    const subject = 'Register Success - color4.me';
    const htmlData = `
        <h1>You already has been member of color4.me with google account!</h1>

        <p>If you regret to join, just remove color4.me app access permission in your google account.</p>

        <p>Visiting this help article: <a href="https://support.google.com/accounts/answer/3466521?hl=en">https://support.google.com/accounts/answer/3466521?hl=en</a></p>

        <p>Sincerely,</p>
        <p>color4 me</p>`;
    return await sendEmail(to, htmlData, subject);
}

async function sendFeedbackEmail(feedback) {
    const subject = 'Feedback - web-auth project';
    const htmlData = `<p>${feedback}</p>`
    const to = process.env.AWS_SES_HELPER;
    // console.log('feedback :>> ', feedback);
    return await sendEmail(to, htmlData, subject);
}

async function sendFeedbackEmailFrom(feedback, from) {
    const subject = `Feedback - ${from.email} | ${from.name}`;
    const htmlData = `<p>${feedback}</p>`
    const to = process.env.AWS_SES_HELPER;
    // console.log('feedback :>> ', feedback);
    return await sendEmail(to, htmlData, subject);
}

module.exports = {
    sendEmail,
    sendValidationEmail,
    sendResetPasswordLinkEmail,
    sendChangingEmail,
    sendWelcomeEmail,
    sendFeedbackEmail,
    sendFeedbackEmailFrom,
};