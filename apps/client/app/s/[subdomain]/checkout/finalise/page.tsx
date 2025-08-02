"use client";

import { useSearchParams } from "next/navigation";
import InternalPageRenderer from "../../_components/internal-page-renderer";
import { useQuery } from "@tanstack/react-query";
import { IPublicOrder, useEditorContext, OrderStatus, alphaToHexCode } from "@tribe-nest/frontend-shared";
import { useCart } from "@tribe-nest/frontend-shared";
import { useEffect } from "react";
import { CheckCircle, XCircle, Clock, Truck, Package, AlertCircle } from "lucide-react";
import { Badge } from "@tribe-nest/frontend-shared";
import Image from "next/image";

export default function Page() {
  const searchParams = useSearchParams();
  const paymentProviderName = searchParams.get("paymentProviderName") as string;
  const paymentId = searchParams.get("paymentId") as string;
  const orderId = searchParams.get("orderId") as string;
  const { profile, themeSettings, navigate, httpClient } = useEditorContext();
  const { clearCart, cartItems } = useCart();

  const { data, isLoading } = useQuery<IPublicOrder>({
    queryKey: ["paymentStatus", paymentId, paymentProviderName, profile?.id, orderId],
    queryFn: async () => {
      const res = await httpClient!.post("/public/orders/finalize", {
        paymentId,
        paymentProviderName,
        profileId: profile?.id,
        orderId,
      });
      return res.data;
    },
    enabled: !!profile?.id,
  });

  // Clear cart when order status is paid
  useEffect(() => {
    if ([OrderStatus.Paid, OrderStatus.Delivered].includes(data?.status as OrderStatus) && cartItems.length > 0) {
      clearCart();
    }
  }, [data?.status, clearCart, cartItems]);

  const getStatusIcon = (status: OrderStatus) => {
    const iconStyle = { color: themeSettings.colors.primary };
    switch (status) {
      case OrderStatus.Paid:
        return <CheckCircle className="w-5 h-5" style={iconStyle} />;
      case OrderStatus.PaymentFailed:
        return <XCircle className="w-5 h-5" style={{ color: themeSettings.colors.text }} />;
      case OrderStatus.Processing:
        return <Clock className="w-5 h-5" style={iconStyle} />;
      case OrderStatus.Shipped:
        return <Truck className="w-5 h-5" style={iconStyle} />;
      case OrderStatus.Delivered:
        return <Package className="w-5 h-5" style={iconStyle} />;
      case OrderStatus.Cancelled:
        return <XCircle className="w-5 h-5" style={{ color: themeSettings.colors.text }} />;
      default:
        return <AlertCircle className="w-5 h-5" style={{ color: themeSettings.colors.text }} />;
    }
  };

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

  const formatStatus = (status: OrderStatus) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <InternalPageRenderer>
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div
              className="h-8 rounded w-1/3 mb-4"
              style={{ backgroundColor: `${themeSettings.colors.text}${alphaToHexCode(0.2)}` }}
            ></div>
            <div
              className="h-4 rounded w-1/2 mb-8"
              style={{ backgroundColor: `${themeSettings.colors.text}${alphaToHexCode(0.2)}` }}
            ></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded"
                  style={{ backgroundColor: `${themeSettings.colors.text}${alphaToHexCode(0.2)}` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </InternalPageRenderer>
    );
  }

  if (!data) {
    return (
      <InternalPageRenderer>
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="text-center">
            <XCircle className="w-12 h-12 mx-auto mb-4" style={{ color: themeSettings.colors.text }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: themeSettings.colors.text }}>
              Order Not Found
            </h2>
            <p style={{ color: themeSettings.colors.text }}>Unable to retrieve order information.</p>
          </div>
        </div>
      </InternalPageRenderer>
    );
  }

  return (
    <InternalPageRenderer>
      <div className="w-full max-w-4xl mx-auto p-6 pb-10">
        {/* Order Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: themeSettings.colors.text }}>
            Order #{data.id}
          </h1>
          <div className="flex items-center gap-3 mb-4">
            {getStatusIcon(data.status)}
            <Badge className={getStatusColor(data.status)}>{formatStatus(data.status)}</Badge>
          </div>
          <div className="text-sm mb-4" style={{ color: themeSettings.colors.text }}>
            <p>Ordered on: {new Date(data.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Order Items */}

        {/* Success Message for Paid Orders */}
        {data.status === OrderStatus.Paid && (
          <div
            className="mt-6 p-4 border rounded-lg"
            style={{
              backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.1)}`,
              borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.3)}`,
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" style={{ color: themeSettings.colors.primary }} />
              <h3 className="font-semibold" style={{ color: themeSettings.colors.primary }}>
                Payment Successful!
              </h3>
            </div>
            <p className="mt-1" style={{ color: themeSettings.colors.text }}>
              Thank you for your purchase. You will receive an email with your order details shortly.
            </p>
          </div>
        )}

        {/* Error Message for Failed Payments */}
        {data.status === OrderStatus.PaymentFailed && (
          <div
            className="mt-6 p-4 border rounded-lg"
            style={{
              backgroundColor: `${themeSettings.colors.text}${alphaToHexCode(0.1)}`,
              borderColor: `${themeSettings.colors.text}${alphaToHexCode(0.3)}`,
            }}
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" style={{ color: themeSettings.colors.text }} />
              <h3 className="font-semibold" style={{ color: themeSettings.colors.text }}>
                Payment Failed
              </h3>
            </div>
            <p className="mt-1" style={{ color: themeSettings.colors.text }}>
              There was an issue processing your payment. Please{" "}
              <span
                style={{ color: themeSettings.colors.primary }}
                className="cursor-pointer underline"
                onClick={() => navigate("/checkout")}
              >
                try again
              </span>{" "}
              or contact support.
            </p>
          </div>
        )}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: themeSettings.colors.text }}>
            Order Items
          </h2>
          <div className="space-y-4">
            {data.items.length === 0 ? (
              <div className="text-center py-8" style={{ color: themeSettings.colors.text }}>
                No items in this order.
              </div>
            ) : (
              data.items.map((item, index) => (
                <div
                  key={`${item.productId}-${item.productVariantId}-${item.isGift}-${item.recipientEmail || ""}-${index}`}
                  className="flex gap-4 items-start border-b pb-4"
                  style={{ borderColor: themeSettings.colors.primary }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.coverImage || ""}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                    style={{ borderRadius: themeSettings.cornerRadius }}
                    width={64}
                    height={64}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate" style={{ color: themeSettings.colors.text }}>
                      {item.title}
                    </div>
                    <div className="text-sm" style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.8)}` }}>
                      ${item.price.toFixed(2)}
                    </div>
                    {item.isGift && (
                      <div className="text-xs mt-1" style={{ color: themeSettings.colors.primary }}>
                        Gift for {item.recipientName} ({item.recipientEmail})
                      </div>
                    )}
                    {item.recipientMessage && (
                      <div
                        className="text-xs mt-1"
                        style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}` }}
                      >
                        Message: {item.recipientMessage}
                      </div>
                    )}
                    <div
                      className="text-xs mt-1"
                      style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}` }}
                    >
                      Qty: {item.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold" style={{ color: themeSettings.colors.primary }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Total */}
        <div
          className="flex justify-between items-center p-4 border-t"
          style={{
            borderColor: themeSettings.colors.primary,
          }}
        >
          <span className="text-lg font-semibold" style={{ color: themeSettings.colors.text }}>
            Total:
          </span>
          <span className="text-lg font-bold" style={{ color: themeSettings.colors.primary }}>
            ${data.totalAmount}
          </span>
        </div>
      </div>
    </InternalPageRenderer>
  );
}
