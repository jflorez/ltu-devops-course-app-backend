import { Pool } from 'mariadb';
import { DBPoolService } from './DBPoolService.js';
import { injectable } from 'inversify';

@injectable()
export default abstract class DBService {
    protected pool: Pool;

    constructor(dbPoolService: DBPoolService) {
        this.pool = dbPoolService.pool;
    }
}
