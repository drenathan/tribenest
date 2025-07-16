import { Kysely } from "kysely";
import { AccountModel } from "./account.model";
import { SessionModel } from "./session.model";
import { DB } from "../types";
import { ProfileModel } from "./profile/profile.model";
import { ProfileAuthorizationModel } from "./profile/profileAuthorization.model";
import { MembershipModel } from "./membership/membership.model";
import { MembershipTierModel } from "./membership/membershipTier.model";
import { MembershipBenefitModel } from "./membership/membershipBenefit.model";
import { MembershipTierBenefitModel } from "./membership/membershipTierBenefit.model";
import { PostCollectionModel } from "./post/postCollection.model";
import { PostCollectionPostModel } from "./post/postCollectionPost.model";
import { PostModel } from "./post/post.model";
import { CommentModel } from "./comment/comment.model";
import { LikeModel } from "./likes/likes.model";
import { WebsiteVersionModel } from "./website/websiteVersion.model";
import { WebsiteVersionPageModel } from "./website/websiteVersionPage.model";
import { MediaModel } from "./media/media.model";
import { MediaMappingModel } from "./media/mediaMapping.model";
import { ProductCategoryModel } from "./product/productCategory.model";
import { ProductModel } from "./product/product.model";
import { ProductVariantModel } from "./product/productVariant.model";
import { ProductVariantOptionModel } from "./product/productVariantOption.model";
import { ProductVariantOptionValueModel } from "./product/productVariantOptionValue.model";
import { ProductVariantConfigurationModel } from "./product/productVariantConfiguration.model";
import { ProductVariantTrackModel } from "./product/productVariantTrack.model";
import { OrderModel } from "./order/order.model";
import { OrderItemModel } from "./order/orderItem.model";
import { ProfileConfigurationModel } from "./profile/profileConfiguration.model";

export const bootstrapModels = (client: Kysely<DB>) => {
  return {
    Account: new AccountModel(client),
    Comment: new CommentModel(client),
    Like: new LikeModel(client),
    Media: new MediaModel(client),
    Membership: new MembershipModel(client),
    MembershipBenefit: new MembershipBenefitModel(client),
    MembershipTier: new MembershipTierModel(client),
    MembershipTierBenefit: new MembershipTierBenefitModel(client),
    Order: new OrderModel(client),
    OrderItem: new OrderItemModel(client),
    Post: new PostModel(client),
    MediaMapping: new MediaMappingModel(client),
    PostCollection: new PostCollectionModel(client),
    PostCollectionPost: new PostCollectionPostModel(client),
    Profile: new ProfileModel(client),
    ProfileAuthorization: new ProfileAuthorizationModel(client),
    ProfileConfiguration: new ProfileConfigurationModel(client),
    ProductCategory: new ProductCategoryModel(client),
    Product: new ProductModel(client),
    ProductVariant: new ProductVariantModel(client),
    ProductVariantOption: new ProductVariantOptionModel(client),
    ProductVariantOptionValue: new ProductVariantOptionValueModel(client),
    ProductVariantConfiguration: new ProductVariantConfigurationModel(client),
    ProductVariantTrack: new ProductVariantTrackModel(client),
    Session: new SessionModel(client),
    WebsiteVersion: new WebsiteVersionModel(client),
    WebsiteVersionPage: new WebsiteVersionPageModel(client),
  };
};
