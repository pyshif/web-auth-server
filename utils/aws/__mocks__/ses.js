const sendEmail = jest.fn((to, htmlData, subject) => true);
const sendValidationEmail = jest.fn((to, url) => true);
const sendResetPasswordLinkEmail = jest.fn((to, url) => true);
const sendChangingEmail = jest.fn((to, url) => true);
const sendWelcomeEmail = jest.fn((to) => true);
const sendFeedbackEmail = jest.fn((feedback) => true);
const sendFeedbackEmailFrom = jest.fn((feedback, from) => true);

module.exports = {
    sendEmail,
    sendValidationEmail,
    sendResetPasswordLinkEmail,
    sendChangingEmail,
    sendWelcomeEmail,
    sendFeedbackEmail,
    sendFeedbackEmailFrom
}