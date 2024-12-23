import { describe, expect, test } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/app.js';
import { Category } from '../../src/common/api/data/Speedrun.js';
import 'dotenv/config';

describe('@api category', () => {
    describe('create and list categories', () => {
        const apiKey = process.env.APP_API_TOKEN!;
        const defaultCategory: Omit<Category, 'id'> = {
            name: 'New Category',
            description: 'A test category',
        };

        let testCategoryId: string;

        beforeAll(async () => {
            const response = await request(app).post('/api/categories').send(defaultCategory).set('X-API-KEY', apiKey);
            expect(response.status).toBe(200);
            testCategoryId = response.body.details as string;
        });

        test('should get all categories', async () => {
            const response = await request(app).get('/api/categories').set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(Array.isArray(response.body.details)).toBe(true);
            expect(response.body.details.length).toBeGreaterThan(0);
        });

        test('should create a new category', async () => {
            const response = await request(app).post('/api/categories').send(defaultCategory).set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(typeof response.body.details).toBe('string');
        });

        test('should get a specific category by id', async () => {
            const response = await request(app).get(`/api/categories/${testCategoryId}`).set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(response.body.details).toHaveProperty('id', testCategoryId);
        });
    });

    describe('Category update and delete operations', () => {
        const apiKey = process.env.APP_API_TOKEN!;
        let updateCategory: Category;
        let updateCategoryId: string;
        beforeAll(async () => {
            // Create a new category for each test with unique data
            const newCategory: Omit<Category, 'id'> = {
                name: 'Unique Category',
                description: 'A unique test category',
            };

            const createResponse = await request(app).post('/api/categories').send(newCategory).set('X-API-KEY', apiKey);

            updateCategoryId = createResponse.body.details as string;

            const getResponse = await request(app).get(`/api/categories/${updateCategoryId}`).set('X-API-KEY', apiKey);

            updateCategory = getResponse.body.details as Category;
        });
        test('should update an existing category', async () => {
            const updatedCategory: Category = {
                ...updateCategory,
                name: 'Updated Category',
            };

            const response = await request(app)
                .put(`/api/categories/${updateCategory.id}`)
                .send(updatedCategory)
                .set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');

            const verifyResponse = await request(app).get(`/api/categories/${updateCategoryId}`).set('X-API-KEY', apiKey);
            const verifiedCategory = verifyResponse.body.details as Category;

            expect(verifiedCategory.name).toBe('Updated Category');
        });
    });

    describe('Category delete operation', () => {
        const apiKey = process.env.APP_API_TOKEN!;
        let updateCategoryId: string;

        beforeAll(async () => {
            // Create a new category for the delete test
            const newCategory: Omit<Category, 'id'> = {
                name: 'Unique Category for Deletion',
                description: 'A unique test category for deletion',
            };

            const createResponse = await request(app).post('/api/categories').send(newCategory).set('X-API-KEY', apiKey);

            updateCategoryId = createResponse.body.details as string;
        });

        test('should delete a category', async () => {
            const response = await request(app).delete(`/api/categories/${updateCategoryId}`).set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');

            // Verify deletion
            const getResponse = await request(app).get(`/api/categories/${updateCategoryId}`).set('X-API-KEY', apiKey);

            expect(getResponse.status).toBe(404);
            expect(getResponse.body.message).toBe('Internal error');
            expect(getResponse.body.details.reason).toBe('Category not found');
        });
    });
});
