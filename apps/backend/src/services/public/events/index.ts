import { OrderStatus } from "@src/db/types/product";
import { CreateOrderInput, FinalizeOrderInput } from "@src/routes/public/events/schema";
import { BaseService, BaseServiceArgs } from "@src/services/baseService";
import { PaymentStatus } from "@src/services/paymentProvider/PaymentProvider";
import { BadRequestError, NotFoundError } from "@src/utils/app_error";
import { round } from "lodash";
import { validateEventPass } from "./commands/validateEventPass";

export class EventsService extends BaseService {
  public readonly validateEventPass: typeof validateEventPass;

  constructor(args: BaseServiceArgs) {
    super(args);
    this.validateEventPass = validateEventPass.bind(this);
  }

  public async getEventById({ eventId, profileId }: { eventId: string; profileId: string }) {
    const event = await this.models.Event.getMany({
      profileId,
      filter: {
        eventId,
      },
      page: 1,
      limit: 1,
    });

    return event.data[0];
  }

  public async createOrder(input: CreateOrderInput & { eventId: string }) {
    const ticketIds = Object.keys(input.items);
    const tickets = await this.models.EventTicket.find({ id: ticketIds });

    const amount = round(
      tickets.reduce((acc, ticket) => acc + Number(ticket.price) * input.items[ticket.id], 0),
      2,
    );

    const paymentProvider = await this.apis.getPaymentProvider(input.profileId);
    const payment = await paymentProvider.startCharge({
      amount,
      currency: "usd",
      email: input.email,
      returnUrl: "http://drenathan1.localhost:3001/checkout",
    });

    return this.database.client.transaction().execute(async (trx) => {
      const order = await this.models.EventTicketOrder.insertOne(
        {
          totalAmount: amount,
          eventId: input.eventId,
          status: OrderStatus.InitiatedPayment,
          paymentProviderName: paymentProvider.name,
          paymentId: payment.paymentId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
        },
        trx,
      );

      await this.models.EventTicketOrderItem.insertMany(
        tickets.map((ticket) => ({
          eventTicketId: ticket.id,
          eventTicketOrderId: order.id,
          quantity: input.items[ticket.id],
          price: ticket.price,
        })),
        trx,
      );

      return {
        ...payment,
        orderId: order.id,
        totalAmount: amount,
      };
    });
  }

  public async finalizeOrder(input: FinalizeOrderInput) {
    const order = await this.models.EventTicketOrder.getOrderById({
      orderId: input.orderId,
      profileId: input.profileId,
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.status !== OrderStatus.InitiatedPayment) {
      return order;
    }

    if (!order.paymentId) {
      throw new BadRequestError("Invalid order");
    }

    const paymentProvider = await this.apis.getPaymentProvider(input.profileId);
    const paymentStatus = await paymentProvider.getPaymentStatus(order.paymentId);
    const status = this.getOrderStatus(paymentStatus);
    const tickets = await this.models.EventTicket.find({ id: order.items.map((item) => item.eventTicketId!) });

    await this.database.client.transaction().execute(async (trx) => {
      await this.models.EventTicketOrder.updateOne({ id: order.id! }, { status }, trx);

      if (status === OrderStatus.Paid) {
        for (const item of order.items) {
          const ticket = tickets.find((ticket) => ticket.id === item.eventTicketId);
          if (ticket) {
            await this.models.EventTicket.updateOne({ id: ticket.id }, { sold: ticket.sold + item.quantity! }, trx);

            await this.models.EventPass.insertMany(
              Array.from({ length: item.quantity! }, () => ({
                eventTicketOrderItemId: item.id!,
                eventTicketId: ticket.id,
                eventId: order.eventId!,
                ownerName: order.firstName + " " + order.lastName,
                ownerEmail: order.email!,
              })),
            );
          }
        }
      }
    });

    return this.models.EventTicketOrder.getOrderById({ orderId: order.id!, profileId: input.profileId });
  }

  private getOrderStatus(paymentStatus: PaymentStatus) {
    switch (paymentStatus) {
      case PaymentStatus.Succeeded:
        return OrderStatus.Paid;
      case PaymentStatus.Pending:
        return OrderStatus.InitiatedPayment;
      default:
        return OrderStatus.PaymentFailed;
    }
  }
}
