import { Get, Route, Tags, Response } from 'tsoa';
import { ErrorResponse, SuccessResponse } from '../data/Responses.js';
import { provideSingleton } from '../../ioc/provide_singleton.js';

@Tags('Health')
@Route('api/health')
@provideSingleton(HealthController)
@Response<ErrorResponse>('500', 'unexpected error')
export class HealthController {
    @Get()
    public getHealth(): Promise<SuccessResponse<string>> {
        return Promise.resolve({
            message: 'success',
            details: 'ok',
        });
    }
}
