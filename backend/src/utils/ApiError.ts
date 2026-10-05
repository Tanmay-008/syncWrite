export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public data: unknown = null,
        public success: boolean = false
    ) {
        super(message);

        Error.captureStackTrace(this, this.constructor);
    }
}