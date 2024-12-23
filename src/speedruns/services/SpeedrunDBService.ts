import { inject } from 'inversify';
import DBService from '../../common/api/services/db/DBService.js';
import { DBPoolService } from '../../common/api/services/db/DBPoolService.js';
import { Speedrun } from '../../common/api/data/Speedrun.js';
import { provideSingleton } from '../../common/ioc/provide_singleton.js';

@provideSingleton(SpeedrunDBService)
export default class SpeedrunDBService extends DBService {
    constructor(@inject(DBPoolService) dbPoolService: DBPoolService) {
        super(dbPoolService);
    }

    private readonly baseSpeedrunQuery = `
        SELECT 
            s.id AS speedrunId, 
            g.id AS gameId, g.name AS gameName, g.description AS gameDescription, g.console AS gameConsole, g.releaseDate AS gameReleaseDate,
            u.id AS userId, u.name AS userName, u.registeredAt AS userRegisteredAt,
            s.time_ms AS speedrunTime, s.date AS speedrunDate,
            c.id AS categoryId, c.name AS categoryName, c.description AS categoryDescription
        FROM Speedrun s
        JOIN Game g ON s.gameId = g.id
        JOIN User u ON s.runnerId = u.id
        JOIN Category c ON s.categoryId = c.id
    `;

    private mapRowToSpeedrun(row: any): Speedrun {
        return {
            id: row.speedrunId,
            game: {
                id: row.gameId,
                name: row.gameName,
                description: row.gameDescription,
                console: row.gameConsole,
                releaseDate:
                    row.gameReleaseDate instanceof Date ? row.gameReleaseDate : new Date(row.gameReleaseDate as string),
            },
            runner: {
                id: row.userId,
                name: row.userName,
                registeredAt:
                    row.userRegisteredAt instanceof Date
                        ? row.userRegisteredAt
                        : new Date(row.userRegisteredAt as string),
            },
            time_ms: Number(row.speedrunTime),
            date: row.speedrunDate instanceof Date ? row.speedrunDate : new Date(row.speedrunDate as string),
            category: {
                id: row.categoryId,
                name: row.categoryName,
                description: row.categoryDescription,
            },
        };
    }

    async getSpeedruns(gameId?: string): Promise<Speedrun[]> {
        let query = this.baseSpeedrunQuery;
        const params: string[] = [];

        if (gameId) {
            query += ' WHERE s.gameId = ?';
            params.push(gameId);
        }

        const rows: any[] = await this.pool.query(query, params);
        return rows.map(row => this.mapRowToSpeedrun(row));
    }

    async getSpeedrun(id: string): Promise<Speedrun | null> {
        const query = `${this.baseSpeedrunQuery} WHERE s.id = ?`;
        const rows: any[] = await this.pool.query(query, [id]);
        return rows.length === 0 ? null : this.mapRowToSpeedrun(rows[0]);
    }

    async insertSpeedrun(speedrun: Omit<Speedrun, 'id'>): Promise<string> {
        const id = crypto.randomUUID();
        const query = `
            INSERT INTO Speedrun (id, gameId, runnerId, time_ms, date, categoryId)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const formattedDate = speedrun.date.toISOString().slice(0, 19).replace('T', ' ');
        await this.pool.query(query, [
            id,
            speedrun.game.id,
            speedrun.runner.id,
            speedrun.time_ms,
            formattedDate,
            speedrun.category.id,
        ]);

        return id;
    }

    async updateSpeedrun(speedrun: Speedrun): Promise<void> {
        const query = `
            UPDATE Speedrun 
            SET gameId = ?,
                runnerId = ?,
                time_ms = ?,
                date = ?,
                categoryId = ?
            WHERE id = ?
        `;

        const formattedDate = speedrun.date.toISOString().slice(0, 19).replace('T', ' ');
        await this.pool.query(query, [
            speedrun.game.id,
            speedrun.runner.id,
            speedrun.time_ms,
            formattedDate,
            speedrun.category.id,
            speedrun.id,
        ]);
    }

    async deleteSpeedrun(id: string): Promise<number> {
        const response = await this.pool.query('DELETE FROM Speedrun WHERE id = ?', [id]);
        return response.affectedRows;
    }
}
