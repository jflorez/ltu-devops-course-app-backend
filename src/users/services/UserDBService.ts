import { inject } from 'inversify';
import DBService from '../../common/api/services/db/DBService.js';
import { DBPoolService } from '../../common/api/services/db/DBPoolService.js';
import { User } from '../../common/api/data/Speedrun.js'; // Assuming User interface is defined here
import { provideSingleton } from '../../common/ioc/provide_singleton.js';

@provideSingleton(UserDBService)
export default class UserDBService extends DBService {
    constructor(@inject(DBPoolService) dbPoolService: DBPoolService) {
        super(dbPoolService);
    }

    async getUsers(): Promise<User[]> {
        const query = `
            SELECT 
                id, 
                name, 
                registeredAt 
            FROM User
        `;
        const rows: any[] = await this.pool.query(query);
        return rows.map(
            (row: any): User => ({
                id: row.id,
                name: row.name,
                registeredAt: row.registeredAt,
            }),
        );
    }

    async getUser(id: string): Promise<User | null> {
        const query = `
            SELECT 
                id, 
                name, 
                registeredAt 
            FROM User
            WHERE id = ?
        `;
        const rows: any[] = await this.pool.query(query, [id]);
        if (rows.length === 0) {
            return null;
        }
        const row = rows[0];
        return {
            id: row.id,
            name: row.name,
            registeredAt: row.registeredAt,
        };
    }

    async insertUser(user: Omit<User, 'id'>): Promise<string> {
        const id = crypto.randomUUID();
        const query = `
            INSERT INTO User (id, name, registeredAt)
            VALUES (?, ?, ?)
        `;
        await this.pool.query(query, [id, user.name, user.registeredAt]);
        return id;
    }

    async updateUser(user: User): Promise<void> {
        const query = `
            UPDATE User 
            SET name = ?,
                registeredAt = ?
            WHERE id = ?
        `;
        await this.pool.query(query, [user.name, user.registeredAt, user.id]);
    }

    async deleteUser(id: string): Promise<void> {
        const query = `DELETE FROM User WHERE id = ?`;
        await this.pool.query(query, [id]);
    }
}
