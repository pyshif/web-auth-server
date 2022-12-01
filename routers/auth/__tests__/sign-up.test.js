
let server;

beforeAll(() => {
    // mock process.env
    jest.resetModules();
    process.env.NODE_ENV = 'development';
    // mock aws ses
    jest.mock('../../../utils/aws/ses');

    // start server
    const app = require('../../../app');
    server = app.listen(process.env.SERVER_PORT, () => {
        console.log(`Server running at port: ${process.env.SERVER_PORT}`);
    });

});

afterAll(() => {
    // shutdown server
    server.close();
});

describe('test /auth/signup API', () => {

    const axios = require('axios');

    let apiSignUp;
    let validationLink;

    beforeEach(() => {
        apiSignUp = axios.create({
            baseURL: process.env.SERVER_BASEURL + 'auth/signup/'
        });
    });


    it('GET /auth/signup/health :>> 200 OK', async () => {
        let response;
        try {
            response = await apiSignUp({
                method: 'GET',
                url: '/health'
            })
            // console.log('res.status :>> ', res.status);
        } catch (error) {
            console.log('error :>> ', error);
        }
        expect(response.status).toBe(200);
    });

    // !!! if you testing on local, please ensure database has runned !!!
    it('POST /auth/signup/ :>> 200 OK, and recevie email address vaildation link', async () => {
        const { sendValidationEmail } = require('../../../utils/aws/ses');
        let response;

        try {
            const data = {
                name: 'tester-1',
                email: 'tester-1@mail.com',
                password: 'Cc123456@',
                confirmPassword: 'Cc123456@',
                passwordHint: 'today is a nice day'
            }
            response = await apiSignUp({
                method: 'POST',
                data
            });

        } catch (error) {
            console.log('error :>> ', error.message);
        }

        // get validation-link for next testing
        validationLink = sendValidationEmail.mock.calls[0][1];
        // console.log('sendValidationEmail.mock.calls[0] :>> ', sendValidationEmail.mock.calls[0]);

        expect(sendValidationEmail).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(200);
    });

    it('GET /auth/signup/:token :>> 302 OK', async () => {
        let response;
        try {
            response = await axios({
                method: 'GET',
                url: validationLink,
                maxRedirects: 0
            });
            // console.log('response :>> ', response);

        } catch (error) {
            // console.log('error :>> ', error);
            response = error.response;
        }

        expect(response.status).toBe(302);
    });

    it('Clear DB web-auth.users', async () => {
        const knex = require('../../../utils/knex');

        try {
            const del = await knex('users')
                .del();

            const alter = await knex.schema.raw("ALTER TABLE users AUTO_INCREMENT = 1");

            console.log('del :>> ', del);
            console.log('alter :>> ', alter);
        } catch (error) {
            console.log('error :>> ', error);
        }
    });
});