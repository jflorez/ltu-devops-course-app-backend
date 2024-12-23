import { Get, Route, Response, Path, Body, Delete, Post, Put, Security, Controller, Tags } from 'tsoa';
import { ErrorResponse, SuccessResponse } from '../../common/api/data/Responses.js';
import { provideSingleton } from '../../common/ioc/provide_singleton.js';
import { inject } from 'inversify';
import CategoryDBService from '../services/CategoryDBService.js';
import { Category } from '../../common/api/data/Speedrun.js';

@Route('api/categories')
@Security('api_key')
@Response<ErrorResponse>('500', 'unexpected error')
@provideSingleton(CategoryController)
@Tags('Category')
export class CategoryController extends Controller {
    constructor(@inject(CategoryDBService) private categoryDBService: CategoryDBService) {
        super();
    }

    @Get()
    public async getCategories(): Promise<SuccessResponse<Category[]>> {
        const categories = await this.categoryDBService.getCategories();
        return {
            message: 'success',
            details: categories,
        };
    }

    @Get('{id}')
    public async getCategory(@Path() id: string): Promise<SuccessResponse<Category> | ErrorResponse> {
        const category = await this.categoryDBService.getCategory(id);
        if (!category) {
            this.setStatus(404);
            return {
                message: 'Internal error',
                details: {
                    reason: 'Category not found',
                },
            };
        }
        return {
            message: 'success',
            details: category,
        };
    }

    @Post()
    public async createCategory(@Body() category: Omit<Category, 'id'>): Promise<SuccessResponse<string>> {
        const id = await this.categoryDBService.insertCategory(category);
        return {
            message: 'success',
            details: id,
        };
    }

    @Put('{id}')
    public async updateCategory(
        @Path() id: string,
        @Body() category: Category,
    ): Promise<SuccessResponse<void> | ErrorResponse> {
        if (id !== category.id) {
            this.setStatus(404);
            return {
                message: 'Internal error',
                details: {
                    reason: 'Path id does not match category id',
                },
            } as ErrorResponse;
        }
        await this.categoryDBService.updateCategory(category);
        return {
            message: 'success',
            details: undefined,
        };
    }

    @Delete('{id}')
    public async deleteCategory(@Path() id: string): Promise<SuccessResponse<void>> {
        await this.categoryDBService.deleteCategory(id);
        return {
            message: 'success',
            details: undefined,
        };
    }
}
