import { describe, expect, test, beforeAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/app.js';
import { Game } from '../../src/common/api/data/Speedrun.js';
import 'dotenv/config';

describe('@api game', () => {
    describe('create and list games', () => {
        const apiKey = process.env.APP_API_TOKEN!;
        const defaultGame: Omit<Game, 'id'> = {
            name: 'New Game',
            description: 'A test game',
            console: 'Test Console',
            releaseDate: new Date(),
        };

        let testGameId: string;

        beforeAll(async () => {
            const response = await request(app).post('/api/games').send(defaultGame).set('X-API-KEY', apiKey);
            expect(response.status).toBe(200);
            testGameId = response.body.details as string;
        });

        test('should get all games', async () => {
            const response = await request(app).get('/api/games').set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(Array.isArray(response.body.details)).toBe(true);
            expect(response.body.details.length).toBeGreaterThan(0);
        });

        test('should create a new game', async () => {
            const response = await request(app).post('/api/games').send(defaultGame).set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(typeof response.body.details).toBe('string');
        });

        test('should get a specific game by id', async () => {
            const response = await request(app).get(`/api/games/${testGameId}`).set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(response.body.details).toHaveProperty('id', testGameId);
        });
    });

    describe('Game update and delete operations', () => {
        const apiKey = process.env.APP_API_TOKEN!;
        let updateGame: Game;
        let updateGameId: string;

        beforeAll(async () => {
            const newGame: Omit<Game, 'id'> = {
                name: 'Unique Game',
                description: 'A unique test game',
                console: 'Unique Console',
                releaseDate: new Date(),
            };

            const createResponse = await request(app).post('/api/games').send(newGame).set('X-API-KEY', apiKey);

            updateGameId = createResponse.body.details as string;

            const getResponse = await request(app).get(`/api/games/${updateGameId}`).set('X-API-KEY', apiKey);

            updateGame = getResponse.body.details as Game;
        });

        test('should update an existing game', async () => {
            const updatedGame: Game = {
                ...updateGame,
                name: 'Updated Game',
            };

            const response = await request(app)
                .put(`/api/games/${updateGame.id}`)
                .send(updatedGame)
                .set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');

            const verifyResponse = await request(app).get(`/api/games/${updateGameId}`).set('X-API-KEY', apiKey);
            const verifiedGame = verifyResponse.body.details as Game;

            expect(verifiedGame.name).toBe('Updated Game');
        });

        test('should delete a game', async () => {
            const response = await request(app).delete(`/api/games/${updateGameId}`).set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');

            // Verify deletion
            const getResponse = await request(app).get(`/api/games/${updateGameId}`).set('X-API-KEY', apiKey);

            expect(getResponse.status).toBe(404);
            expect(getResponse.body.message).toBe('Internal error');
            expect(getResponse.body.details.reason).toBe('Game not found');
        });
    });
});