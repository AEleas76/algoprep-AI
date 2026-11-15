// An error that carries an HTTP status and a machine-readable code,
// so the error middleware can turn it into a consistent JSON response.
class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

module.exports = AppError;