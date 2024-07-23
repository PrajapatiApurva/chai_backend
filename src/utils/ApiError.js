class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong...",
        errors = [],
        stack = ""
    ){
        super(message);
        this.errors = error;
        this.statusCode = statusCode;
        this.stack = stack;
        this.data = null || {};
        this.message = message;
        this.success = false;

        if (stack) {
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }