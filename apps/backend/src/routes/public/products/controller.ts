import { Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { GetMembershipTiersInput, getMembershipTiersSchema } from "@src/routes/membershipTiers/schema";
import { NextFunction, Request, Response } from "express";
import { GetProductsInput, getProductsSchema } from "./schema";
import { GetProductInput, getProductSchema } from "@src/routes/product/schema";

export class PublicProducts extends BaseController {
  @RouteHandler()
  @ValidateSchema(getMembershipTiersSchema)
  public async getFeaturedProducts(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetMembershipTiersInput,
  ): Promise<any> {
    return this.services.membership.getMembershipTiers(query!.profileId);
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
