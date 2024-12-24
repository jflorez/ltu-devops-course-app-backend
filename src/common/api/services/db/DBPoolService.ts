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
        if (this._pool === undefined) {
            console.debug('Creating new MariaDB pool with the following configuration:');
            console.debug(`Host: ${process.env.MARIADB_HOST}`);
            console.debug(`User: ${process.env.MARIADB_USER}`);
            console.debug(`Password: ${process.env.MARIADB_PASSWORD}`);
            console.debug(`Database: ${process.env.MARIADB_DATABASE}`);
            console.debug(`Port: ${process.env.MARIADB_PORT}`);
            console.debug(`Connection Limit: ${this.limit}`);
            
            this._pool = mariadb.createPool({
                host: process.env.MARIADB_HOST,
                user: process.env.MARIADB_USER,
                password: process.env.MARIADB_PASSWORD,
                database: process.env.MARIADB_DATABASE,
                port: Number(process.env.MARIADB_PORT),
                connectionLimit: this.limit,
            });
            
            console.debug('MariaDB pool created successfully.');
        } else {
            console.debug('Using existing MariaDB pool.');
        }
        return this._pool;
    }
}
