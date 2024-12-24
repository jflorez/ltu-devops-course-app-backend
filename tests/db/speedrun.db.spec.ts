import { DBPoolService } from '../../src/common/api/services/db/DBPoolService.js';
import SpeedrunDBService from '../../src/speedruns/services/SpeedrunDBService.js';

describe('@db speedrun', () => {
    let dbPoolService: DBPoolService;
    let speedrunDBService: SpeedrunDBService;

    beforeEach(() => {
        dbPoolService = new DBPoolService();
        speedrunDBService = new SpeedrunDBService(dbPoolService);
    });

    afterEach(async () => {
        await dbPoolService.pool.end(); // Ensure the pool is closed after each test
    });

    test('should get all speedruns', async () => {
        const speedruns = await speedrunDBService.getSpeedruns();
        expect(speedruns.length).toBeGreaterThan(0);
    });
});
