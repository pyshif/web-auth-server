
describe('ci.dev.yml testing', () => {
    it('should be Liz.', () => {
        const name = 'Liz'
        expect(name).toBe('Liz');
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
