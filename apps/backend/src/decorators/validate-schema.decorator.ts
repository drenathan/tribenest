import { IS_DEVELOPMENT } from "@src/configuration/secrets";
import { logger } from "@src/utils/logger";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const formatZodError = (errors: any[]) => {
  return errors.map((err) => `${err.path.join(".")}: ${err.message}`);
};

const BODY_METADATA_KEY = Symbol("request:body");
const QUERY_METADATA_KEY = Symbol("request:query");

export function Body(target: any, propertyKey: string, parameterIndex: number) {
  Reflect.defineMetadata(BODY_METADATA_KEY, parameterIndex, target, propertyKey);
}

export function Query(target: any, propertyKey: string, parameterIndex: number) {
  Reflect.defineMetadata(QUERY_METADATA_KEY, parameterIndex, target, propertyKey);
}

export function ValidateSchema(schema: z.AnyZodObject) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, ...args: any[]) {
      const numberOfArgsDestructured = 2;
      const result = await schema.safeParseAsync({
        body: req.body || {},
        query: req.query || {},
      });

      if (!result.success) {
        if (IS_DEVELOPMENT) logger.info(result.error.errors);
        return res.status(400).json({
          message: formatZodError(result.error.errors),
        });
      }

      const bodyIndex = Reflect.getMetadata(BODY_METADATA_KEY, target, propertyKey);
      if (bodyIndex !== undefined) {
        args[bodyIndex - numberOfArgsDestructured] = result.data.body;
      }

      const queryIndex = Reflect.getMetadata(QUERY_METADATA_KEY, target, propertyKey);
      if (queryIndex !== undefined) {
        args[queryIndex - numberOfArgsDestructured] = result.data.query;
      }

      return originalMethod.apply(this, [req, res, ...args]);
    };
  };
}
