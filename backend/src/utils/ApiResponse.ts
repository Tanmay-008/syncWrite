export class ApiResponse {
    public success: boolean;
    public data: any;
    public message: string;
    public statusCode: number;

    constructor(statusCode: number, data: any, message: string = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}
