class AppError extends Error{
    constructor(message,statusCode)
    {
        super(message)

        this.statusCode = statusCode || 500
        this.status = `${statusCode}`.startsWith('4')?'fail':'error'
        this.message = message
        this.isOperational = true

        console.log('Hello from appError.js')
        Error.captureStackTrace(this,this.constructor)
    }
}

module.exports = AppError