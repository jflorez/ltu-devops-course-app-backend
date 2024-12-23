import { Get, Route, Response, Path, Body, Delete, Post, Put, Security, Controller, Tags } from 'tsoa';
import { ErrorResponse, SuccessResponse } from '../../common/api/data/Responses.js';
import { provideSingleton } from '../../common/ioc/provide_singleton.js';
import { inject } from 'inversify';
import GameDBService from '../services/GameDBService.js';
import { Game } from '../../common/api/data/Speedrun.js';

@Route('api/games')
@Security('api_key')
@Response<ErrorResponse>('500', 'unexpected error')
@provideSingleton(GameController)
@Tags('Game')
export class GameController extends Controller {
    constructor(@inject(GameDBService) private gameDBService: GameDBService) {
        super();
    }

    @Get()
    public async getGames(): Promise<SuccessResponse<Game[]>> {
        const games = await this.gameDBService.getGames();
        return {
            message: 'success',
            details: games,
        };
    }

    @Get('{id}')
    public async getGame(@Path() id: string): Promise<SuccessResponse<Game> | ErrorResponse> {
        const game = await this.gameDBService.getGame(id);
        if (!game) {
            this.setStatus(404);
            return {
                message: 'Internal error',
                details: {
                    reason: 'Game not found',
                },
            };
        }
        return {
            message: 'success',
            details: game,
        };
    }

    @Post()
    public async createGame(@Body() game: Omit<Game, 'id'>): Promise<SuccessResponse<string>> {
        const id = await this.gameDBService.insertGame(game);
        return {
            message: 'success',
            details: id,
        };
    }

    @Put('{id}')
    public async updateGame(@Path() id: string, @Body() game: Game): Promise<SuccessResponse<void> | ErrorResponse> {
        if (id !== game.id) {
            this.setStatus(404);
            return {
                message: 'Internal error',
                details: {
                    reason: 'Path id does not match game id',
                },
            } as ErrorResponse;
        }
        await this.gameDBService.updateGame(game);
        return {
            message: 'success',
            details: undefined,
        };
    }

    @Delete('{id}')
    public async deleteGame(@Path() id: string): Promise<SuccessResponse<void>> {
        await this.gameDBService.deleteGame(id);
        return {
            message: 'success',
            details: undefined,
        };
    }
}
