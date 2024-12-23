import { app } from './app.js';

const port = process.env.APP_API_PORT;

const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

process.on('SIGINT', () => {
    console.log('[SIGINT]');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

process.on('SIGTERM', () => {
    console.log('[SIGTERM]');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
