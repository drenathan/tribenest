import { NextFunction, Request, Response } from "express";
import { IS_PRODUCTION, IS_TEST } from "@config/secrets";
import { AppError } from "./app_error";
import { logger } from "./logger";

const sendErrorResponse = (err: AppError, req: Request, res: Response) => {
  if (err.isOperational) {
    const errorData = {
      status: err.statuscode,
      message: err.message,
      ...(!IS_PRODUCTION && { stack: err.stack }),
    };
    res.status(err.statuscode).json({ ...errorData });
  } else {
    if (IS_TEST) console.log(err);

    res.status(500).json({
      status: "error",
      message: "Something went wrong.",
    });
  }
};

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statuscode = err.statuscode || 500;
  err.status = err.status || "error";
  if (!IS_TEST && err.statuscode === 500) logger.error(err);
  let error = { ...err };
  error.message = err.message;

  sendErrorResponse(error, req, res);
};

export default globalErrorHandler;
