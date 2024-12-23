import { describe, expect, test, beforeAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/app.js';
import { Speedrun, Game, User, Category } from '../../src/common/api/data/Speedrun.js';
import 'dotenv/config';
import GameDBService from '../../src/games/services/GameDBService.js';
import UserDBService from '../../src/users/services/UserDBService.js';
import CategoryDBService from '../../src/categories/services/CategoryDBService.js';
import SpeedrunDBService from '../../src/speedruns/services/SpeedrunDBService.js';
import { DBPoolService } from '../../src/common/api/services/db/DBPoolService.js';

const apiKey = process.env.APP_API_TOKEN!;
const defaultGame: Omit<Game, 'id'> = {
    name: 'Test Game',
    description: 'A game for testing',
    console: 'Test Console',
    releaseDate: new Date(),
};
const defaultUser: Omit<User, 'id'> = {
    name: 'Test User',
    registeredAt: new Date(),
};
const defaultCategory: Omit<Category, 'id'> = {
    name: 'Test Category',
    description: 'A category for testing',
};
const testSpeedruns: Speedrun[] = [];
let gameId: string;
let userId: string;
let categoryId: string;

describe('@api speedrun', () => {
    beforeAll(async () => {
        const dbPoolService = new DBPoolService();
        const gameDBService = new GameDBService(dbPoolService);
        const userDBService = new UserDBService(dbPoolService);
        const categoryDBService = new CategoryDBService(dbPoolService);
        const speedrunDBService = new SpeedrunDBService(dbPoolService);

        gameId = await gameDBService.insertGame(defaultGame);
        userId = await userDBService.insertUser(defaultUser);
        categoryId = await categoryDBService.insertCategory(defaultCategory);

        const speedruns = [1000, 2000, 3000].map(time => ({
            game: { id: gameId, ...defaultGame },
            runner: { id: userId, ...defaultUser },
            time_ms: time,
            date: new Date(),
            category: { id: categoryId, ...defaultCategory },
        }));

        for (const speedrun of speedruns) {
            const id = await speedrunDBService.insertSpeedrun(speedrun);
            testSpeedruns.push({ ...speedrun, id });
        }
    });
    describe('list and create speedruns', () => {
        test('should get all speedruns', async () => {
            const response = await request(app).get(`/api/speedruns?gameId=${gameId}`).set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(Array.isArray(response.body.details)).toBe(true);
            expect(response.body.details.length).toBeGreaterThan(0);
        });

        test('should create a new valid speedrun', async () => {
            const newSpeedrun: Omit<Speedrun, 'id'> = {
                game: { id: gameId, ...defaultGame },
                runner: { id: userId, ...defaultUser },
                time_ms: 900,
                date: new Date(),
                category: { id: categoryId, ...defaultCategory },
            };

            const response = await request(app).post('/api/speedruns').send(newSpeedrun).set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(typeof response.body.details).toBe('string');
        });

        test('should not create an unreasonable speedrun', async () => {
            const newSpeedrun: Omit<Speedrun, 'id'> = {
                game: { id: gameId, ...defaultGame },
                runner: { id: userId, ...defaultUser },
                time_ms: 10,
                date: new Date(),
                category: { id: categoryId, ...defaultCategory },
            };

            const response = await request(app).post('/api/speedruns').send(newSpeedrun).set('X-API-KEY', apiKey);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Internal error');
            expect(response.body.details.checkResult).toBeDefined();
            expect(response.body.details.checkResult).toHaveProperty('isUnreasonable', true);
            expect(response.body.details.checkResult).toHaveProperty('standardDeviations');
            expect(response.body.details.checkResult.standardDeviations).toBeGreaterThan(2);
            expect(response.body.details.checkResult).toHaveProperty('message', 'Speedrun is an unreasonable world record improvement');
        });

        test('should get a specific speedrun by id', async () => {
            const response = await request(app).get(`/api/speedruns/${testSpeedruns[0].id}`).set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');
            expect(response.body.details).toHaveProperty('id', testSpeedruns[0].id);
        });
    });

    describe('Speedrun update and delete operations', () => {
        test('should update an existing speedrun', async () => {
            const updatedSpeedrun: Speedrun = {
                ...testSpeedruns[0],
                time_ms: testSpeedruns[0].time_ms + 10,
            };

            const response = await request(app)
                .put(`/api/speedruns/${updatedSpeedrun.id}`)
                .send(updatedSpeedrun)
                .set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');

            const verifyResponse = await request(app)
                .get(`/api/speedruns/${testSpeedruns[0].id}`)
                .set('X-API-KEY', apiKey);
            const verifiedSpeedrun = verifyResponse.body.details as Speedrun;

            expect(verifiedSpeedrun.time_ms).toBe(updatedSpeedrun.time_ms);
        });

        test('should delete a speedrun', async () => {
            let response = await request(app).delete(`/api/speedruns/${testSpeedruns[0].id}`).set('X-API-KEY', apiKey);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('success');

            response = await request(app).get(`/api/speedruns/${testSpeedruns[0].id}`).set('X-API-KEY', apiKey);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Internal error');
            expect(response.body.details.reason).toBe('Speedrun not found');
        });
    });
});
