import { Get, Route, Response, Path, Body, Delete, Post, Put, Query, Security, Controller, Tags } from 'tsoa';
import { ErrorResponse, SuccessResponse } from '../../common/api/data/Responses.js';
import { provideSingleton } from '../../common/ioc/provide_singleton.js';
import { inject } from 'inversify';
import SpeedrunDBService from '../services/SpeedrunDBService.js';
import { Speedrun } from '../../common/api/data/Speedrun.js';
import CategoryDBService from '../../categories/services/CategoryDBService.js';
import UserDBService from '../../users/services/UserDBService.js';
import GameDBService from '../../games/services/GameDBService.js';
import SpeedrunStats from '../SpeedrunStats.js';

@Route('api/speedruns')
@Security('api_key')
@Response<ErrorResponse>('500', 'unexpected error', {
    message: 'Internal error',
    details: {},
})
@provideSingleton(SpeedrunController)
@Tags('Speedrun')
export class SpeedrunController extends Controller {
    constructor(
        @inject(SpeedrunDBService) private speedrunDBService: SpeedrunDBService,
        @inject(GameDBService) private gameDBService: GameDBService,
        @inject(UserDBService) private userDBService: UserDBService,
        @inject(CategoryDBService) private categoryDBService: CategoryDBService,
    ) {
        super();
    }

    @Get()
    public async getSpeedruns(@Query() gameId: string): Promise<SuccessResponse<Speedrun[]>> {
        const speedRuns = await this.speedrunDBService.getSpeedruns(gameId);
        return {
            message: 'success',
            details: speedRuns,
        };
    }

    @Get('{id}')
    public async getSpeedrun(@Path() id: string): Promise<SuccessResponse<Speedrun> | ErrorResponse> {
        const speedrun = await this.speedrunDBService.getSpeedrun(id);
        if (!speedrun) {
            this.setStatus(404);
            return {
                message: 'Internal error',
                details: {
                    reason: 'Speedrun not found',
                },
            } as ErrorResponse;
        }
        return {
            message: 'success',
            details: speedrun,
        };
    }

    @Post()
    public async createSpeedrun(
        @Body() speedrun: Omit<Speedrun, 'id'>,
    ): Promise<SuccessResponse<string> | ErrorResponse> {
        const error = await this.checkUnreasonableSpeedrun(speedrun);
        if (error) {
            this.setStatus(404);
            return error;
        }
        const id = await this.speedrunDBService.insertSpeedrun(speedrun);
        return {
            message: 'success',
            details: id,
        };
    }

    @Put('{id}')
    public async updateSpeedrun(
        @Path() id: string,
        @Body() speedrun: Speedrun,
    ): Promise<SuccessResponse<void> | ErrorResponse> {
        if (id !== speedrun.id) {
            this.setStatus(404);
            return {
                message: 'Internal error',
                details: {
                    reason: 'Path id does not match speedrun id',
                },
            };
        }
        const error = await this.checkUnreasonableSpeedrun(speedrun);
        if (error) {
            this.setStatus(404);
            return error;
        }

        const [game, user, category] = await Promise.all([
            this.gameDBService.getGame(speedrun.game.id),
            this.userDBService.getUser(speedrun.runner.id),
            this.categoryDBService.getCategory(speedrun.category.id),
        ]);
        if (!game || !user || !category) {
            this.setStatus(404);
            return {
                message: 'Internal error',
                details: {
                    reason: `${!game ? 'game' : ''}${!user ? 'user' : ''}${!category ? 'category' : ''} not found`,
                },
            } as ErrorResponse;
        }
        await this.speedrunDBService.updateSpeedrun(speedrun);
        return {
            message: 'success',
            details: undefined,
        };
    }

    @Delete('{id}')
    public async deleteSpeedrun(@Path() id: string): Promise<SuccessResponse<void>> {
        await this.speedrunDBService.deleteSpeedrun(id);
        return {
            message: 'success',
            details: undefined,
        };
    }

    private async checkUnreasonableSpeedrun(
        speedrun: Omit<Speedrun, 'id'> | Speedrun,
    ): Promise<ErrorResponse | undefined> {
        const speedrunStats = new SpeedrunStats();
        const runs = await this.speedrunDBService.getSpeedruns(speedrun.game.id);
        const [worldRecordCheck, personalProgressCheck] = [
            speedrunStats.isUnreasonableWorldRecord(runs, { ...speedrun, id: '' }),
            speedrunStats.isUnreasonablePersonalBest(runs, { ...speedrun, id: '' })
        ];

        const unreasonableCheck = worldRecordCheck.isUnreasonable ? worldRecordCheck : personalProgressCheck.isUnreasonable ? personalProgressCheck : null;

        if (!unreasonableCheck) {
            return undefined;
        }

        return {
            message: 'Internal error',
            details: {
                checkResult: unreasonableCheck,
            },
        };
    }
}
