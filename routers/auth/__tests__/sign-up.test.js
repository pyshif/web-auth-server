require('dotenv').config({ path: '.env.dev' });
const knex = require('../../../utils/knex');
const axios = require('axios');

describe('test /auth/signup API', () => {
    it('should be existed user that name is test-1', async () => {

        try {
            const instance = axios.create({
                baseURL: process.env.SERVER_BASEURL
            });

            const data = {
                name: 'test-1',
                email: 'test-1@mail.com',
                password: 'Cc123456@',
                confirmPassword: 'Cc123456@',
                passwordHint: 'CCDay is nice day'
            };

            const response = await instance({
                method: 'POST',
                url: '/auth/signup',
                data
            });

            console.log('response :>> ', response);

        } catch (error) {
            console.log('axios error :>> ', error);
        }

        let rows;

        try {
            rows = await knex.select()
                .from('users')
                .where('email', 'test-1@mail.com');

            if (rows.length < 1) {
                throw new Error('No user')
            }
        } catch (error) {
            console.log('sql error :>> ', error);
        }

        const user = rows[0];
        expect(user.email).toBe('test-1@mail.com');
    });
});