import { BaseController } from "@src/routes/baseController";
import { Request, Response, NextFunction } from "express";

export function ControllerErrorHandler() {
  return function (target: BaseController, nameMethod: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: [Request, Response, NextFunction]) {
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (error) {
        return args[2](error);
      }
    };
  };
}
