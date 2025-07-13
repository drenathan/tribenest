export class AppError extends Error {
  statuscode: number;
  status: string;
  isOperational: boolean;

  constructor(statuscode: number, message: string) {
    super(message);

    this.statuscode = statuscode;
    this.status = `${statuscode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(404, message);
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = "You are not authenticated") {
    super(401, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}
