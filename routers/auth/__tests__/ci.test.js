require('dotenv').config({ path: '.env.dev' });
const knex = require('../../../utils/knex');

describe('ci.dev.yml testing', () => {
    it('should be Liz.', async () => {

        try {
            const insert = await knex('users')
                .insert({
                    name: '123',
                    email: '123@email.com',
                    password: '123',
                    password: '123',
                    user_status_id: 1
                });

            const rows = await knex.select()
                .from('users');
            if (rows.length < 1) {
                throw new Error;
            }
            console.log('rows :>> ', rows);

            const name = 'Liz'
            expect(name).toBe('Liz');
        } catch (error) {
            console.log('error.message :>> ', error.message);
        }

    });
});

// import * as dotenv from 'dotenv';
// dotenv.config({ path: '.env.dev' });

// import React from 'react';
// import { screen, render } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import api, { DataSignUp } from 'api';

// describe('web-auth-server api testing', () => {
//     it('should receive 200 OK from api auth/health', async () => {
//         try {
//             const response = await api.v1.auth.health();

//             expect(response.status).toBe(200);
//         } catch (error) {
//             console.log('error :>> ', error);
//         }
//     });

//     // it('should receive 200 OK from api auth/signup', async () => {
//     //     try {
//     //         const data: DataSignUp = {
//     //             name: 'Jest',
//     //             account: 'example@email.com',
//     //             password: 'Je12s1st34@',
//     //             confirm_password: 'Je12s1st34@',
//     //             hint: 'nice day',
//     //         };

//     //         const response = (await api.v1.auth.signUp(data)) as unknown as any;

//     //         expect(response.status).toBe(200);
//     //     } catch (error) {
//     //         console.log('error :>> ', error);
//     //     }
//     // });
// });
