import 'dotenv/config';
import 'reflect-metadata';
import bodyParser from 'body-parser';
import express, { Express } from 'express';

import swaggerUi from 'swagger-ui-express';
import { RegisterRoutes } from '../build/routes.js';
import cors from 'cors';

const app: Express = express();

app.use(
    cors({
        origin: true,
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'X-API-KEY'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    }),
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

RegisterRoutes(app);
const json = await import('../build/swagger.json', {
    with: { type: 'json' },
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(json.default));

export { app };
