import * as express from 'express';

export function expressAuthentication(request: express.Request, securityName: string): Promise<any> {
    // Bypass authentication for OPTIONS requests
    if (request.method === 'OPTIONS') {
        return Promise.resolve({});
    }

    if (securityName === 'api_key') {
        let token;
        if (request.get('X-API-KEY')) {
            token = request.get('X-API-KEY');
        }
        if (token === process.env.APP_API_TOKEN) {
            return Promise.resolve({});
        } else {
            return Promise.reject({
                message: 'unauthorized',
            });
        }
    } else {
        return Promise.reject({
            message: 'unauthorized',
        });
    }
}
