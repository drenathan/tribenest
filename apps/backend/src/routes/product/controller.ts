import { Body, isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import {
  CreateProductInput,
  createProductSchema,
  createExternalStoreSchema,
  GetProductInput,
  getProductSchema,
  GetProductsInput,
  getProductsSchema,
  UpdateProductInput,
  updateProductSchema,
  CreateExternalStoreInput,
} from "./schema";
import * as policy from "./policy";
import { profileIdQuerySchema } from "../schema";

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
    const id = req.params.id as string;
    return this.services.admin.products.getOne({ ...query!, productId: id });
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
    const id = req.params.id as string;
    return this.services.admin.products.update({ ...body!, productId: id });
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

  @RouteHandler()
  @ValidateSchema(createExternalStoreSchema)
  @isAuthorized(policy.create)
  public async createExternalStore(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateExternalStoreInput,
  ): Promise<any> {
    const store = await this.services.admin.products.createProductStore(body!);

    await this.workers.jobs.products.syncExternalProducts.now({ storeId: store.id });

    return store;
  }

  @RouteHandler()
  @isAuthorized(policy.getAll)
  @ValidateSchema(profileIdQuerySchema)
  public async getStores(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: { profileId: string },
  ): Promise<any> {
    return this.services.admin.products.getStores({ profileId: req.query.profileId as string });
  }
}
