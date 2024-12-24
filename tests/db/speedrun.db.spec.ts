import { DBPoolService } from '../../src/common/api/services/db/DBPoolService.js';
import SpeedrunDBService from '../../src/speedruns/services/SpeedrunDBService.js';

describe('@db speedrun', () => {
    test('should get all speedruns', async () => {
        const dbPoolService = new DBPoolService();
        const speedrunDBService = new SpeedrunDBService(dbPoolService);
        
        const pool = dbPoolService.pool;

        const databases = await pool.query('SHOW DATABASES');
        console.log('Databases:', databases);

        const tables = await pool.query('SHOW TABLES');
        console.log('Tables:', tables);
        
        const speedruns = await speedrunDBService.getSpeedruns();
        expect(speedruns.length).toBeGreaterThan(0);
    });
});
