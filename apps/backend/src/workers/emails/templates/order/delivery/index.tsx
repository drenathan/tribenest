import React from "react";
import { render } from "@react-email/components";
import { Template } from "./template";
import BaseEmailTemplate, { BaseTemplateArgs } from "@src/workers/emails/BaseEmailTemplate";
import { IOrderItem } from "@src/db/models/order/orderItem.model";
import { Selectable } from "kysely";

export interface IArchive {
  filename: string;
  url: string;
  size: number;
}

export interface IVariables extends BaseTemplateArgs {
  orderId: string;
  totalAmount: string;
  date: string;
  archive: IArchive;
  recipientEmail: string;
  recipientName: string;
  recipientMessage: string | null;
  isGift: boolean;
  senderName?: string;
  items: Selectable<IOrderItem>[];
  senderEmail?: string;
}

export class OrderDeliveryTemplate extends BaseEmailTemplate<IVariables> {
  name = "ORDER_DELIVERY_EMAIL";
  tags = [this.name];
  retryCount = 3;

  public getSubject(variables: IVariables) {
    if (variables.isGift) {
      return `🎁 Musical Gift from ${variables.senderName}`;
    }
    return `🎵 Your music is ready for download!`;
  }

  public getPreviewVariables(): IVariables {
    return {
      profileId: "123",
      recipientEmail: "jane@example.com",
      recipientName: "Jane Smith",
      recipientMessage: "Hope you enjoy this track!",
      senderName: "John Doe",
      senderEmail: "john.doe@example.com",
      orderId: "ORD-123456",
      items: [
        {
          title: "Summer Vibes Album",
          price: "9.99",
          quantity: 1,
          productId: "prod_123456",
          productVariantId: "var_123456",
          createdAt: new Date(),
          coverImage: "https://example.com/cover.jpg",
          id: "item_123456",
          isGift: false,
          orderId: "ORD-123456",
          payWhatYouWant: false,
          recipientName: "Jane Smith",
          recipientEmail: "jane@example.com",
          recipientMessage: "Hope you enjoy this track!",
          updatedAt: new Date(),
        },
        {
          title: "Chill Beats Single",
          price: "2.99",
          quantity: 1,
          productId: "prod_123456",
          productVariantId: "var_123456",
          createdAt: new Date(),
          coverImage: "https://example.com/cover.jpg",
          id: "item_123456",
          isGift: true,
          orderId: "ORD-123456",
          payWhatYouWant: false,
          recipientName: "Jane Smith",
          recipientEmail: "jane@example.com",
          recipientMessage: "Hope you enjoy this track!",
          updatedAt: new Date(),
        },
      ],
      archive: {
        filename: "order-123456-gift-jane-example-com-2024-01-15.zip",
        url: "https://example.com/downloads/order-123456-gift-jane-example-com-2024-01-15.zip",
        size: 10485760, // 10MB
      },
      isGift: true,
      totalAmount: "12.98",
      date: "January 15, 2024",
      to: ["customer@example.com"],
    };
  }

  public async getHtml(variables: IVariables) {
    return render(<Template {...variables} />);
  }
}
