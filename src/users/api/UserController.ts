import { Get, Route, Response, Path, Body, Delete, Post, Put, Security, Controller, Tags } from 'tsoa';
import { ErrorResponse, SuccessResponse } from '../../common/api/data/Responses.js';
import { provideSingleton } from '../../common/ioc/provide_singleton.js';
import { inject } from 'inversify';
import UserDBService from '../services/UserDBService.js';
import { User } from '../../common/api/data/Speedrun.js';

@Route('api/users')
@Security('api_key')
@Response<ErrorResponse>('500', 'unexpected error')
@provideSingleton(UserController)
@Tags('User')
export class UserController extends Controller {
    constructor(@inject(UserDBService) private userDBService: UserDBService) {
        super();
    }

    @Get()
    public async getUsers(): Promise<SuccessResponse<User[]>> {
        const users = await this.userDBService.getUsers();
        return {
            message: 'success',
            details: users,
        };
    }

    @Get('{id}')
    public async getUser(@Path() id: string): Promise<SuccessResponse<User> | ErrorResponse> {
        const user = await this.userDBService.getUser(id);
        if (!user) {
            this.setStatus(404);
            return {
                message: 'Internal error',
                details: {
                    reason: 'User not found',
                },
            };
        }
        return {
            message: 'success',
            details: user,
        };
    }

    @Post()
    public async createUser(@Body() user: Omit<User, 'id'>): Promise<SuccessResponse<string>> {
        const id = await this.userDBService.insertUser(user);
        return {
            message: 'success',
            details: id,
        };
    }

    @Put('{id}')
    public async updateUser(@Path() id: string, @Body() user: User): Promise<SuccessResponse<void> | ErrorResponse> {
        if (id !== user.id) {
            this.setStatus(404);
            return {
                message: 'Internal error',
                details: {
                    reason: 'Path id does not match user id',
                },
            } as ErrorResponse;
        }
        await this.userDBService.updateUser(user);
        return {
            message: 'success',
            details: undefined,
        };
    }

    @Delete('{id}')
    public async deleteUser(@Path() id: string): Promise<SuccessResponse<void>> {
        await this.userDBService.deleteUser(id);
        return {
            message: 'success',
            details: undefined,
        };
    }
}
