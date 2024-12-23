import { describe, expect, test, beforeAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/app.js';
import { User } from '../../src/common/api/data/Speedrun.js';
import 'dotenv/config';

describe('@api user', () => {
    describe('create and list users', () => {
        const apiKey = process.env.APP_API_TOKEN!;
        const defaultUser: Omit<User, 'id'> = {
            name: 'New User',
            registeredAt: new Date(),
        };

        let testUserId: string;

        beforeAll(async () => {
            const response = await request(app).post('/api/users').send(defaultUser).set('X-API-KEY', apiKey);
            expect(response.status).toBe(200);
            testUserId = response.body.details as string;
        });

        test('should get all users', async () => {
            const response = await request(app).get('/api/users').set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(Array.isArray(response.body.details)).toBe(true);
            expect(response.body.details.length).toBeGreaterThan(0);
        });

        test('should create a new user', async () => {
            const response = await request(app).post('/api/users').send(defaultUser).set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(typeof response.body.details).toBe('string');
        });

        test('should get a specific user by id', async () => {
            const response = await request(app).get(`/api/users/${testUserId}`).set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(response.body.details).toHaveProperty('id', testUserId);
        });
    });

    describe('User update and delete operations', () => {
        const apiKey = process.env.APP_API_TOKEN!;
        let updateUser: User;
        let updateUserId: string;

        beforeAll(async () => {
            const newUser: Omit<User, 'id'> = {
                name: 'Unique User',
                registeredAt: new Date(),
            };

            const createResponse = await request(app).post('/api/users').send(newUser).set('X-API-KEY', apiKey);

            updateUserId = createResponse.body.details as string;

            const getResponse = await request(app).get(`/api/users/${updateUserId}`).set('X-API-KEY', apiKey);

            updateUser = getResponse.body.details as User;
        });

        test('should update an existing user', async () => {
            const updatedUser: User = {
                ...updateUser,
                name: 'Updated User',
            };

            const response = await request(app)
                .put(`/api/users/${updateUser.id}`)
                .send(updatedUser)
                .set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');

            const verifyResponse = await request(app).get(`/api/users/${updateUserId}`).set('X-API-KEY', apiKey);
            const verifiedUser = verifyResponse.body.details as User;

            expect(verifiedUser.name).toBe('Updated User');
        });

        test('should delete a user', async () => {
            const response = await request(app).delete(`/api/users/${updateUserId}`).set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');

            // Verify deletion
            const getResponse = await request(app).get(`/api/users/${updateUserId}`).set('X-API-KEY', apiKey);

            expect(getResponse.status).toBe(404);
            expect(getResponse.body.message).toBe('Internal error');
            expect(getResponse.body.details.reason).toBe('User not found');
        });
    });
});
