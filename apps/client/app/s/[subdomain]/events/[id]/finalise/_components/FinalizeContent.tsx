"use client";

import InternalPageRenderer from "@/app/s/[subdomain]/_components/internal-page-renderer";
import {
  ITicketOrder,
  useEditorContext,
  Badge,
  Separator,
  OrderStatus,
  alphaToHexCode,
  LoadingState,
} from "@tribe-nest/frontend-shared";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { round } from "lodash";

export function FinalizeContent() {
  const { httpClient, profile, themeSettings } = useEditorContext();
  const searchParams = useSearchParams();
  const { id } = useParams();
  const orderId = searchParams.get("orderId") as string;

  const { data, isLoading } = useQuery<ITicketOrder>({
    queryKey: ["eventTicketOrderStatus", profile?.id, orderId],
    queryFn: async () => {
      const res = await httpClient!.post(`/public/events/${id}/finalize`, {
        profileId: profile?.id,
        orderId,
      });
      return res.data;
    },
    enabled: !!profile?.id,
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Paid:
      case OrderStatus.Delivered:
        return `bg-[${themeSettings.colors.primary}${alphaToHexCode(0.2)}] text-[${themeSettings.colors.primary}]`;
      case OrderStatus.PaymentFailed:
      case OrderStatus.Cancelled:
        return `bg-[${themeSettings.colors.text}${alphaToHexCode(0.2)}] text-[${themeSettings.colors.text}]`;
      case OrderStatus.Processing:
        return `bg-[${themeSettings.colors.primary}${alphaToHexCode(0.2)}] text-[${themeSettings.colors.primary}]`;
      case OrderStatus.Shipped:
        return `bg-[${themeSettings.colors.primary}${alphaToHexCode(0.2)}] text-[${themeSettings.colors.primary}]`;
      default:
        return `bg-[${themeSettings.colors.text}${alphaToHexCode(0.2)}] text-[${themeSettings.colors.text}]`;
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount}`;
  };

  if (isLoading) {
    return (
      <InternalPageRenderer>
        <LoadingState />
      </InternalPageRenderer>
    );
  }

  if (!data) {
    return (
      <InternalPageRenderer>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Order not found</div>
        </div>
      </InternalPageRenderer>
    );
  }

  return (
    <InternalPageRenderer>
      <div className="max-w-4xl mx-auto p-6 space-y-6 pb-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Your Order</h1>
          <p>Order ID: {data.id}</p>
        </div>

        {/* Success Message */}
        {data.status === OrderStatus.Paid && (
          <div
            className="border-1 border-primary rounded-md p-4"
            style={{
              borderColor: themeSettings?.colors.primary + "30",
            }}
          >
            <div className="text-center">
              <div>
                <h3 className="text-lg font-semibold mb-2">🎉 Payment Successful!</h3>
                <p>Your tickets have been confirmed. You should receive a confirmation email shortly.</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Status */}
        {data.status !== OrderStatus.Paid && (
          <div>
            <div className="flex items-center justify-between">
              Order Status
              <Badge className={`${getStatusColor(data.status)}`}>{data.status.replace("_", " ").toUpperCase()}</Badge>
            </div>
          </div>
        )}

        {/* Customer Details */}
        <div
          className="border-1 border-primary rounded-md p-4"
          style={{
            borderColor: themeSettings?.colors.primary + "30",
          }}
        >
          <div className="text-lg font-semibold mb-4">Customer Details</div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Name:</span>
              <span>
                {data.firstName} {data.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{data.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Event:</span>
              <span>{data.eventTitle}</span>
            </div>
          </div>
        </div>

        {/* Ticket Items */}
        <div
          className="border-1 border-primary rounded-md p-4"
          style={{
            borderColor: themeSettings?.colors.primary + "30",
          }}
        >
          <div className="space-y-4">
            {data.items.map((item, index) => (
              <div key={item.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                    <p className="text-lg font-bold">{formatCurrency(round(item.price * item.quantity, 2))}</p>
                  </div>
                </div>
                {index < data.items.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div>
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total Amount:</span>
            <span>{formatCurrency(data.totalAmount)}</span>
          </div>
        </div>
      </div>
    </InternalPageRenderer>
  );
}
