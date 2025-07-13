import { NextFunction, Request, Response } from "express";

export function RouteHandler(params?: { statusCode?: number }) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (req: Request, res: Response, next: NextFunction, ...args: any[]) {
      try {
        const result = await originalMethod.apply(this, [req, res, next, ...args]);

        if (res.headersSent) return; // if response has already been sent, don't send again
        return res.status(params?.statusCode || 200).json(result);
      } catch (error) {
        return next(error);
      }
    };
  };
}
