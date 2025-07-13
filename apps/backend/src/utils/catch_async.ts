import { Request, Response, NextFunction } from "express";

type RouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const catchAsyncErrors = (fn: RouteHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsyncErrors;
