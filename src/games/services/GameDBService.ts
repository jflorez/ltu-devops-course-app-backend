import { inject } from 'inversify';
import DBService from '../../common/api/services/db/DBService.js';
import { DBPoolService } from '../../common/api/services/db/DBPoolService.js';
import { Game } from '../../common/api/data/Speedrun.js';
import { provideSingleton } from '../../common/ioc/provide_singleton.js';

@provideSingleton(GameDBService)
export default class GameDBService extends DBService {
    constructor(@inject(DBPoolService) dbPoolService: DBPoolService) {
        super(dbPoolService);
    }

    async getGames(): Promise<Game[]> {
        const query = `
            SELECT 
                id, 
                name, 
                description, 
                console, 
                releaseDate 
            FROM Game
        `;

        const rows: any[] = await this.pool.query(query);

        return rows.map(
            (row: any): Game => ({
                id: row.id,
                name: row.name,
                description: row.description,
                console: row.console,
                releaseDate: row.releaseDate,
            }),
        );
    }

    async getGame(id: string): Promise<Game | null> {
        const query = `
            SELECT 
                id, 
                name, 
                description, 
                console, 
                releaseDate 
            FROM Game
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
            description: row.description,
            console: row.console,
            releaseDate: row.releaseDate,
        };
    }

    async insertGame(game: Omit<Game, 'id'>): Promise<string> {
        const id = crypto.randomUUID();
        const query = `
            INSERT INTO Game (id, name, description, console, releaseDate)
            VALUES (?, ?, ?, ?, ?)
        `;

        await this.pool.query(query, [id, game.name, game.description, game.console, game.releaseDate]);

        return id;
    }

    async updateGame(game: Game): Promise<void> {
        const query = `
            UPDATE Game 
            SET name = ?,
                description = ?,
                console = ?,
                releaseDate = ?
            WHERE id = ?
        `;

        await this.pool.query(query, [game.name, game.description, game.console, game.releaseDate, game.id]);
    }

    async deleteGame(id: string): Promise<void> {
        const query = `DELETE FROM Game WHERE id = ?`;
        await this.pool.query(query, [id]);
    }
}
