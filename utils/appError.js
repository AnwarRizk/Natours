class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // status: fail or error
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // operational error or programming error
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
