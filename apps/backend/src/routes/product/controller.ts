import { Body, isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import {
  CreateProductInput,
  createProductSchema,
  GetProductInput,
  getProductSchema,
  GetProductsInput,
  getProductsSchema,
  UpdateProductInput,
  updateProductSchema,
} from "./schema";
import * as policy from "./policy";

export class ProductsController extends BaseController {
  @RouteHandler()
  @ValidateSchema(getProductsSchema)
  @isAuthorized(policy.getAll)
  public async getProducts(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetProductsInput,
  ): Promise<any> {
    return this.services.admin.products.getProducts(query!);
  }

  @RouteHandler()
  @ValidateSchema(createProductSchema)
  @isAuthorized(policy.create)
  public async createProduct(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateProductInput,
  ): Promise<any> {
    return this.services.admin.products.create(body!);
  }

  @RouteHandler()
  @ValidateSchema(getProductSchema)
  @isAuthorized(policy.getAll)
  public async getProduct(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetProductInput,
  ): Promise<any> {
    return true;
  }

  @RouteHandler()
  @ValidateSchema(updateProductSchema)
  @isAuthorized(policy.create)
  public async updateProduct(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: UpdateProductInput,
  ): Promise<any> {
    return true;
  }

  @RouteHandler()
  @isAuthorized(policy.create)
  public async archiveProduct(req: Request, res: Response, next: NextFunction): Promise<any> {
    return this.services.admin.products.archiveProduct(req.params.id as string);
  }

  @RouteHandler()
  @isAuthorized(policy.create)
  public async unarchiveProduct(req: Request, res: Response, next: NextFunction): Promise<any> {
    return this.services.admin.products.unarchiveProduct(req.params.id as string);
  }
}
