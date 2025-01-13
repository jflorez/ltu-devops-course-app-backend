import mariadb, { Pool } from 'mariadb';
import { provideSingleton } from '../../../ioc/provide_singleton.js';

@provideSingleton(DBPoolService)
export class DBPoolService {
    private limit = 20;
    private _pool: Pool | undefined;

    public withLimit(limit: number): DBPoolService {
        this.limit = limit;
        return this;
    }

    get pool(): Pool {
        console.log('MARIADB_HOST:', process.env.MARIADB_HOST);
        console.log('MARIADB_USER:', process.env.MARIADB_USER);
        console.log('MARIADB_PASSWORD:', process.env.MARIADB_PASSWORD);
        console.log('MARIADB_DATABASE:', process.env.MARIADB_DATABASE);
        console.log('MARIADB_PORT:', process.env.MARIADB_PORT);
        if (this._pool === undefined) {
            this._pool = mariadb.createPool({
                host: process.env.MARIADB_HOST,
                user: process.env.MARIADB_USER,
                password: process.env.MARIADB_PASSWORD,
                database: process.env.MARIADB_DATABASE,
                port: Number(process.env.MARIADB_PORT),
                connectionLimit: this.limit,
            });
        }
        return this._pool;
    }
}
