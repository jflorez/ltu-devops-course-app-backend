export interface SuccessResponse<T> {
    message: string;
    details: T;
}

export interface ErrorResponse extends SuccessResponse<Record<string, unknown>> {
    message: 'Internal error';
}
