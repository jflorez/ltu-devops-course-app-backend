import { inject } from 'inversify';
import DBService from '../../common/api/services/db/DBService.js';
import { DBPoolService } from '../../common/api/services/db/DBPoolService.js';
import { Category } from '../../common/api/data/Speedrun.js';
import { provideSingleton } from '../../common/ioc/provide_singleton.js';

@provideSingleton(CategoryDBService)
export default class CategoryDBService extends DBService {
    constructor(@inject(DBPoolService) dbPoolService: DBPoolService) {
        super(dbPoolService);
    }

    async getCategories(): Promise<Category[]> {
        const query = `
            SELECT 
                id AS categoryId, 
                name AS categoryName, 
                description AS categoryDescription
            FROM Category
        `;

        const rows: any[] = await this.pool.query(query);

        return rows.map(
            (row: any): Category => ({
                id: row.categoryId,
                name: row.categoryName,
                description: row.categoryDescription,
            }),
        );
    }

    async getCategory(id: string): Promise<Category | null> {
        const query = `
            SELECT 
                id AS categoryId, 
                name AS categoryName, 
                description AS categoryDescription
            FROM Category
            WHERE id = ?
        `;

        const rows: any[] = await this.pool.query(query, [id]);

        if (rows.length === 0) {
            return null;
        }

        const row = rows[0];
        return {
            id: row.categoryId,
            name: row.categoryName,
            description: row.categoryDescription,
        };
    }

    async insertCategory(category: Omit<Category, 'id'>): Promise<string> {
        const id = crypto.randomUUID();
        const query = `
            INSERT INTO Category (id, name, description)
            VALUES (?, ?, ?)
        `;

        await this.pool.query(query, [id, category.name, category.description]);

        return id;
    }

    async updateCategory(category: Category): Promise<void> {
        const query = `
            UPDATE Category 
            SET name = ?,
                description = ?
            WHERE id = ?
        `;

        await this.pool.query(query, [category.name, category.description, category.id]);
    }

    async deleteCategory(id: string): Promise<void> {
        const query = `DELETE FROM Category WHERE id = ?`;
        await this.pool.query(query, [id]);
    }
}
