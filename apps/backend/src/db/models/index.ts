import { Kysely } from "kysely";
import { AccountModel } from "./account.model";
import { SessionModel } from "./session.model";
import { DB } from "../types";
import { EmailModel } from "./email/email.model";
import { EmailRecipientModel } from "./email/emailRecipient.model";
import { EmailVariableModel } from "./email/emailVariable.model";
import { EventModel } from "./event/event.model";
import { EventTicketModel } from "./event/eventTicket.model";
import { EventTicketOrderModel } from "./event/eventTicketOrder.model";
import { EventTicketOrderItemModel } from "./event/eventTicketOrderItem.model";
import { EventPassModel } from "./event/eventPass.model";
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
import { MediaModel } from "./media/media.model";
import { MediaMappingModel } from "./media/mediaMapping.model";
import { ProductCategoryModel } from "./product/productCategory.model";
import { ProductModel } from "./product/product.model";
import { ProductStoreModel } from "./product/productStore.model";
import { ProductVariantModel } from "./product/productVariant.model";
import { ProductVariantTrackModel } from "./product/productVariantTrack.model";
import { OrderModel } from "./order/order.model";
import { OrderItemModel } from "./order/orderItem.model";
import { OrderDeliveryGroupModel } from "./order/orderDeliveryGroup.model";
import { ProfileConfigurationModel } from "./profile/profileConfiguration.model";
import { ProfilePaymentCustomerModel } from "./profile/profilePaymentCustomer.model";
import { ProfilePaymentPriceModel } from "./profile/profilePaymentPrice.model";
import { ProfilePaymentSubscriptionModel } from "./profile/profilePaymentSubscription.model";
import { SavedModel } from "./saved/saved.mode";
import { ProfileOnboardingStepModel } from "./profile/profileOnboardingStep.model";
import { EmailListModel } from "./emailList/emailList.model";
import { EmailListSubscriberModel } from "./emailList/emailListSubscriber.model";
import { EmailTemplateModel } from "./email/emailTemplate.model";
import { SmartLinkModel } from "./smartLink/smartLink.model";
import { SmartLinkEventModel } from "./smartLink/smartLinkEvent.model";
import { StreamTemplateModel } from "./stream/streamTemplate.model";
import { WebsiteVersionModel } from "./website/websiteVersion.model";
import { WebsiteVersionPageModel } from "./website/websiteVersionPage.model";
import { WebsiteMessageModel } from "./website/websiteMessage.model";
import { WebsiteEventModel } from "./website/websiteEvent.model";

export const bootstrapModels = (client: Kysely<DB>) => {
  return {
    Account: new AccountModel(client),
    Email: new EmailModel(client),
    EmailRecipient: new EmailRecipientModel(client),
    EmailList: new EmailListModel(client),
    EmailListSubscriber: new EmailListSubscriberModel(client),
    EmailTemplate: new EmailTemplateModel(client),
    EmailVariable: new EmailVariableModel(client),
    Event: new EventModel(client),
    EventTicket: new EventTicketModel(client),
    EventTicketOrder: new EventTicketOrderModel(client),
    EventTicketOrderItem: new EventTicketOrderItemModel(client),
    EventPass: new EventPassModel(client),
    Comment: new CommentModel(client),
    Like: new LikeModel(client),
    Saved: new SavedModel(client),
    Media: new MediaModel(client),
    Membership: new MembershipModel(client),
    MembershipBenefit: new MembershipBenefitModel(client),
    MembershipTier: new MembershipTierModel(client),
    MembershipTierBenefit: new MembershipTierBenefitModel(client),
    Order: new OrderModel(client),
    OrderDeliveryGroup: new OrderDeliveryGroupModel(client),
    OrderItem: new OrderItemModel(client),
    Post: new PostModel(client),
    MediaMapping: new MediaMappingModel(client),
    PostCollection: new PostCollectionModel(client),
    PostCollectionPost: new PostCollectionPostModel(client),
    Profile: new ProfileModel(client),
    ProfileAuthorization: new ProfileAuthorizationModel(client),
    ProfileConfiguration: new ProfileConfigurationModel(client),
    ProfileOnboardingStep: new ProfileOnboardingStepModel(client),
    ProfilePaymentCustomer: new ProfilePaymentCustomerModel(client),
    ProfilePaymentPrice: new ProfilePaymentPriceModel(client),
    ProfilePaymentSubscription: new ProfilePaymentSubscriptionModel(client),
    ProductCategory: new ProductCategoryModel(client),
    Product: new ProductModel(client),
    ProductStore: new ProductStoreModel(client),
    ProductVariant: new ProductVariantModel(client),
    ProductVariantTrack: new ProductVariantTrackModel(client),
    Session: new SessionModel(client),
    SmartLink: new SmartLinkModel(client),
    SmartLinkEvent: new SmartLinkEventModel(client),
    StreamTemplate: new StreamTemplateModel(client),
    WebsiteVersion: new WebsiteVersionModel(client),
    WebsiteVersionPage: new WebsiteVersionPageModel(client),
    WebsiteMessage: new WebsiteMessageModel(client),
    WebsiteEvent: new WebsiteEventModel(client),
  };
};
