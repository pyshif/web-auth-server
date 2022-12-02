const axios = require('axios');

// store info between testings
const mockMeta = {
    validationLink: '',
    resetPasswordUrl: '',
    refreshToken: '',
    accessToken: '',
}

describe('test /auth/signup API', () => {
    // variable
    let server;
    // init
    beforeAll(() => {
        jest.resetModules();
        // mock
        process.env.NODE_ENV = 'development';
        jest.mock('../../../utils/aws/ses');
        // start server
        const app = require('../../../app');
        const port = process.env.SERVER_PORT;
        server = require('../../../app').listen(port, () => {
            console.log(`Server running at port: ${port}`);
        });
    });
    // deinit
    afterAll(() => {
        server.close();
    });

    // test
    it('GET /auth/signup/health :>> 200 OK', async () => {
        try {
            const response = await axios({
                method: 'GET',
                baseURL: process.env.SERVER_BASEURL + 'auth/signup/',
                url: '/health'
            });

            expect(response.status).toBe(200);
        } catch (error) {
            // console.log('error :>> ', error);
            expect(error).toBeUndefined();
        }
    });

    it('POST /auth/signup/ :>> 200 OK, and receive validation-link', async () => {
        try {
            const data = {
                name: process.env.JEST_USER_NAME,
                email: process.env.JEST_USER_EMAIL,
                password: process.env.JEST_USER_PASSWORD,
                confirmPassword: process.env.JEST_USER_PASSWORD,
                passwordHint: process.env.JEST_USER_PASSWORD_HINT
            };

            const response = await axios({
                method: 'POST',
                baseURL: process.env.SERVER_BASEURL + 'auth/signup/',
                url: '/',
                data
            });

            const mockSendValidationEmail = require('../../../utils/aws/ses').sendValidationEmail;

            expect(response.status).toBe(200);
            expect(mockSendValidationEmail).toHaveBeenCalledTimes(1);
            mockMeta.validationLink = mockSendValidationEmail.mock.calls[0][1];
            // console.log('mockSendValidationEmail.mock.calls[0] :>> ', mockSendValidationEmail.mock.calls[0]);
        } catch (error) {
            // console.log('error :>> ', error);
            expect(error).toBeUndefined();
        }
    });

    it('POST /auth/signup/:token :>> 302 OK', async () => {
        try {
            await axios({
                method: 'GET',
                url: mockMeta.validationLink,
                maxRedirects: 0 // make redirect info into error.response
            });
        } catch (error) {
            // console.log('error :>> ', error);
            const { response } = error;
            expect(response.status).toBe(302);
        }
    });
});

describe('test /auth/signin API', () => {
    // variable
    let server;
    // init
    beforeAll(() => {
        jest.resetModules();
        // mock
        process.env.NODE_ENV = 'development';

        // start server
        const app = require('../../../app');
        const port = process.env.SERVER_PORT;
        server = app.listen(port, () => {
            console.log(`Server running at port: ${port}`);
        });
    });
    // deinit
    afterAll(() => {
        server.close();
    });
    // test
    it('POST /auth/signin :>> 200 OK, and receive refresh/access token', async () => {
        try {
            const data = {
                email: process.env.JEST_USER_EMAIL,
                password: process.env.JEST_USER_PASSWORD
            };

            const response = await axios({
                method: 'POST',
                baseURL: process.env.SERVER_BASEURL + 'auth/signin/',
                url: '/',
                data
            });

            const cookie = response.headers['set-cookie'][0];

            expect(response.status).toBe(200);
            expect(cookie).toMatch(/^C4RFT.*$/);
            expect(response.data).toHaveProperty('accessToken');

            mockMeta.refreshToken = cookie.split('; ')[0].split('=')[1];
            mockMeta.accessToken = response.data.accessToken;
            // console.log('mockMeta :>> ', mockMeta);
        } catch (error) {
            // console.log('error :>> ', error);
            expect(error).toBeUndefined();
        }
    });
});

describe('test /auth/token API', () => {
    // variable
    let server;
    let mockCookies;
    // init
    beforeAll(() => {
        jest.resetModules();
        // mock
        process.env.NODE_ENV = 'development';
        // !!! Express Middleware only loading once on initialize !!!
        // !!! So, cookie-parser must mock before server start !!!
        mockCookies = require('cookie-parser');
        jest.mock('cookie-parser', () => {
            return jest.fn().mockReturnValue((req, res, next) => {
                const { cookies } = req;
                req.cookies = {
                    ...cookies,
                    C4RFT: mockMeta.refreshToken
                };
                next();
            });
        });
        // start server
        const app = require('../../../app');
        const port = process.env.SERVER_PORT;
        server = app.listen(port, () => {
            console.log(`Server running at port: ${port}`);
        });
    });
    // deinit
    afterAll(() => {
        server.close();
    });
    // test
    it('GET /auth/token :>> 200 OK', async () => {
        try {
            const response = await axios({
                method: 'GET',
                baseURL: process.env.SERVER_BASEURL + 'auth/token/',
                url: '/',
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${mockMeta.accessToken}`,
                }
            });

            expect(response.status).toBe(200);
        } catch (error) {
            // console.log('error :>> ', error);
            expect(error).toBeUndefined();
        }
    });

    it('GET /auth/token/new :>> 200 OK, and receive new access token', async () => {
        try {
            const response = await axios({
                method: 'GET',
                baseURL: process.env.SERVER_BASEURL + 'auth/token/',
                url: '/new',
                withCredentials: true,
            });

            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('accessToken');

            mockMeta.accessToken = response.data.accessToken;
        } catch (error) {
            // console.log('error :>> ', error);
            expect(error).toBeUndefined();
        }
    });
});

describe('test /auth/forgot API', () => {
    // variable
    let server;
    let mockSendResetPasswordLinkEmail;
    // init
    beforeAll(() => {
        jest.resetModules();
        // mock
        process.env.NODE_ENV = 'development';
        mockSendResetPasswordLinkEmail = require('../../../utils/aws/ses').sendResetPasswordLinkEmail;
        jest.mock('../../../utils/aws/ses');
        // start server
        const app = require('../../../app');
        const port = process.env.SERVER_PORT;
        server = app.listen(port, () => {
            console.log(`Server running at port: ${port}`);
        });
    });
    // deinit
    afterAll(() => {
        server.close();
    });
    // test
    it('POST /auth/forgot API :>> 200 OK, and receive reset password link', async () => {
        try {
            const data = {
                email: process.env.JEST_USER_EMAIL,
                passwordHint: process.env.JEST_USER_PASSWORD_HINT,
            };

            const response = await axios({
                method: 'POST',
                baseURL: process.env.SERVER_BASEURL + 'auth/forgot/',
                url: '/',
                data
            });

            expect(response.status).toBe(200);
            expect(mockSendResetPasswordLinkEmail).toHaveBeenCalled();

            // receive reset-link (client side page), so we need to extract query param(token)
            mockMeta.resetPasswordUrl = mockSendResetPasswordLinkEmail.mock.calls[0][1].split('/').pop();
            // console.log('mockSendResetPasswordLinkEmail.mock.calls :>> ', mockSendResetPasswordLinkEmail.mock.calls);
            // console.log('mockMeta :>> ', mockMeta);
        } catch (error) {
            // console.log('error :>> ', error);
            expect(error).toBeUndefined();
        }
    });

    it('POST /auth/forgot/:token API :>> 200 OK', async () => {
        try {
            const data = {
                newPassword: process.env.JEST_USER_NEW_PASSWORD,
                confirmPassword: process.env.JEST_USER_NEW_PASSWORD,
            };

            const response = await axios({
                method: 'POST',
                baseURL: process.env.SERVER_BASEURL + 'auth/forgot/',
                url: mockMeta.resetPasswordUrl,
                data,
            });

            expect(response.status).toBe(200);
        } catch (error) {
            // console.log('error :>> ', error);
            expect(error).toBeUndefined();
        }
    });
});

describe('test /auth/signout API', () => {
    // variable
    let server;
    let mockCookies;
    // init
    beforeAll(() => {
        jest.resetModules();
        // mock
        process.env.NODE_ENV = 'development';
        mockCookies = require('cookie-parser');
        jest.mock('cookie-parser', () => {
            return jest.fn().mockReturnValue((req, res, next) => {
                const { cookies } = req;
                req.cookies = {
                    ...cookies,
                    C4RFT: mockMeta.refreshToken
                };
                next();
            });
        });
        // start server
        const app = require('../../../app');
        const port = process.env.SERVER_PORT;
        server = app.listen(port, () => {
            console.log(`Server running at port: ${port}`);
        });
    });
    // deinit
    afterAll(() => {
        server.close();
    });
    // test
    it('DELETE /auth/signout :>> 204 OK', async () => {
        try {
            const response = await axios({
                method: 'DELETE',
                baseURL: process.env.SERVER_BASEURL + 'auth/signout/',
                url: '/'
            });

            expect(response.status).toBe(204);
        } catch (error) {
            console.log('error :>> ', error);
            expect(error).toBeUndefined();
        }
    });
});

describe('clear', () => {
    it('Clear web-auth.users DB', async () => {
        const knex = require('../../../utils/knex');

        try {
            const del = await knex('users')
                .del();

            const alter = await knex.schema.raw("ALTER TABLE users AUTO_INCREMENT = 1");

            // console.log('del :>> ', del);
            // console.log('alter :>> ', alter);
        } catch (error) {
            console.log('error :>> ', error);
            expect(error).toBeUndefined();
        }
    });
});