import React from "react";
import { render } from "@react-email/components";
import { Template } from "./template";
import BaseEmailTemplate, { BaseTemplateArgs } from "@src/workers/emails/BaseEmailTemplate";
import { Selectable } from "kysely";
import { IEvent } from "@src/db/models/event/event.model";

export interface IArchive {
  filename: string;
  url?: string;
  size?: number;
}

export interface IVariables extends BaseTemplateArgs {
  orderId: string;
  totalAmount: string;
  date: string;
  recipientName: string;
  items: { title: string; price: string; quantity: number; eventTicketId: string }[];
  event: Selectable<IEvent>;
  eventPasses: {
    id: string;
    ticketTitle: string;
    eventTitle: string;
    ownerName: string;
    ownerEmail: string;
    checkedInAt: Date | null;
  }[];
}

export class TicketOrderTemplate extends BaseEmailTemplate<IVariables> {
  name = "TICKET_ORDER_DELIVERY_EMAIL";
  tags = [this.name];
  retryCount = 3;

  public getSubject(variables: IVariables) {
    return `🎫 Your tickets are ready!`;
  }

  public getPreviewVariables(): IVariables {
    return {
      event: {
        id: "123",
        title: "Event 1",
        profileId: "123",
        actionLink: "https://example.com",
        actionText: "View Event",
        archivedAt: null,
        description: "Event 1 description",
        dateTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        address: {
          name: "Location 1",
          street: "123 Main St",
          city: "Anytown",
          country: "USA",
          zipCode: "12345",
        },
      },
      profileId: "123",
      recipientName: "Jane Smith",
      orderId: "ORD-123456",
      items: [
        {
          title: "General Admission",
          price: "100",
          quantity: 1,
          eventTicketId: "123456",
        },
        {
          title: "General Admission",
          price: "100",
          quantity: 1,
          eventTicketId: "123456",
        },
      ],
      totalAmount: "12.98",
      date: "January 15, 2024",
      to: ["customer@example.com"],
      eventPasses: [
        {
          id: "TN-123456",
          ticketTitle: "General Admission",
          eventTitle: "Event 1",
          ownerName: "John Doe",
          ownerEmail: "john.doe@example.com",
          checkedInAt: null,
        },
        {
          id: "TN-123456",
          ticketTitle: "General Admission",
          eventTitle: "Event 1",
          ownerName: "John Doe",
          ownerEmail: "john.doe@example.com",
          checkedInAt: null,
        },
      ],
    };
  }

  public async getHtml(variables: IVariables) {
    return render(<Template {...variables} />);
  }
}
