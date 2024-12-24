import { DBPoolService } from '../../src/common/api/services/db/DBPoolService.js';
import SpeedrunDBService from '../../src/speedruns/services/SpeedrunDBService.js';

describe('@db speedrun', () => {
    test('should get all speedruns', async () => {
        const dbPoolService = new DBPoolService();
        const speedrunDBService = new SpeedrunDBService(dbPoolService);

        const pool = dbPoolService.pool;

        const databases = await pool.query('SHOW DATABASES');
        console.log('Databases:', databases);

        const currentDatabase = await pool.query('SELECT DATABASE() AS currentDatabase');
        console.log('Current Database:', currentDatabase[0].currentDatabase);

        const tables = await pool.query('SHOW TABLES');
        console.log('Tables:', tables);

        const speedruns = await speedrunDBService.getSpeedruns();
        expect(speedruns.length).toBeGreaterThan(0);
    });
});
