class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.message = message;
    this.statusCode = 500 || statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

const notFound = (req, _res, next) =>
  next(new CustomError(`Not Found - ${req.originalUrl}`, 404));

const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found!";
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { notFound, errorHandler, CustomError };
