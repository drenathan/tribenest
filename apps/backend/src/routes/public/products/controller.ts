import { Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { GetFeaturedProductsInput, getFeaturedProductsSchema, GetProductsInput, getProductsSchema } from "./schema";
import { GetProductInput, getProductSchema } from "@src/routes/product/schema";

export class PublicProducts extends BaseController {
  @RouteHandler()
  @ValidateSchema(getFeaturedProductsSchema)
  public async getFeaturedProducts(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetFeaturedProductsInput,
  ): Promise<any> {
    return this.services.public.product.getFeaturedProducts(query!);
  }

  @RouteHandler()
  @ValidateSchema(getProductsSchema)
  public async getProducts(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetProductsInput,
  ): Promise<any> {
    return this.services.public.product.getProducts(query!, req.membership);
  }

  @RouteHandler()
  @ValidateSchema(getProductSchema)
  public async getProduct(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetProductInput,
  ): Promise<any> {
    return this.services.public.product.getOne(
      {
        ...query!,
        productId: req.params.id as string,
      },
      req.membership,
    );
  }
}
