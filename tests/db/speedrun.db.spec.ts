import { DBPoolService } from '../../src/common/api/services/db/DBPoolService.js';
import SpeedrunDBService from '../../src/speedruns/services/SpeedrunDBService.js';

describe('@db speedrun', () => {
    test('should get all speedruns', async () => {
        const speedrunDBService = new SpeedrunDBService(new DBPoolService());
        const speedruns = await speedrunDBService.getSpeedruns();
        expect(speedruns.length).toBeGreaterThan(0);
    });
});
