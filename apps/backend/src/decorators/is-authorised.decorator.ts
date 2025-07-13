import { BaseController } from "@src/routes/baseController";
import { PolicyFunction } from "@src/types";
import { UnauthorizedError } from "@src/utils/app_error";
import { NextFunction, Request, Response } from "express";

export function isAuthorized(policyFunction: PolicyFunction) {
  return function (target: any, methodKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction, ...args: any[]) {
      const authorized = await policyFunction(req, (this as BaseController).services);
      if (!authorized) return next(new UnauthorizedError());

      return originalMethod.apply(this, [req, res, next, ...args]);
    };
  };
}
