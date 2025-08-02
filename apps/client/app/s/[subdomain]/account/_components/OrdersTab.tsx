"use client";

import { useQuery } from "@tanstack/react-query";
import {
  usePublicAuth,
  useEditorContext,
  alphaToHexCode,
  Badge,
  Separator,
  IPublicOrder,
  OrderStatus,
} from "@tribe-nest/frontend-shared";
import { CreditCard, CheckCircle, XCircle, Clock, Truck, Package, AlertCircle, ShoppingBag } from "lucide-react";
import Image from "next/image";

export function OrdersTab() {
  const { user } = usePublicAuth();
  const { themeSettings, profile, httpClient } = useEditorContext();

  const { data: orders, isLoading: ordersLoading } = useQuery<IPublicOrder[]>({
    queryKey: ["user-orders", user?.id, profile?.id],
    queryFn: async () => {
      const res = await httpClient!.get("/public/orders", {
        params: { profileId: profile?.id },
      });
      return res.data;
    },
    enabled: !!user?.id && !!profile?.id && !!httpClient,
  });

  // Helper functions
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

  return (
    <div
      className="border rounded-lg p-6"
      style={{
        borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
        backgroundColor: themeSettings.colors.background,
        color: themeSettings.colors.text,
      }}
    >
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <CreditCard className="w-5 h-5" style={{ color: themeSettings.colors.primary }} />
          My Orders
        </h3>
      </div>
      <div>
        {ordersLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded animate-pulse"
                style={{ backgroundColor: `${themeSettings.colors.text}${alphaToHexCode(0.2)}` }}
              />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4"
                style={{ borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Order #{order.id}</h3>
                    <p className="text-sm" style={{ color: themeSettings.colors.text }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <Badge className={getStatusColor(order.status)}>{formatStatus(order.status)}</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={`${item.productId}-${item.productVariantId}-${index}`} className="flex gap-4 items-start">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.coverImage || ""}
                        alt={item.title}
                        className="w-12 h-12 @md:w-16 @md:h-16 object-cover rounded"
                        style={{ borderRadius: themeSettings.cornerRadius }}
                        width={64}
                        height={64}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{item.title}</div>
                        <div
                          className="text-sm"
                          style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.8)}` }}
                        >
                          ${item.price.toFixed(2)}
                        </div>
                        {item.isGift && (
                          <div className="text-xs mt-1" style={{ color: themeSettings.colors.primary }}>
                            Gift for {item.recipientName} ({item.recipientEmail})
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
                  ))}
                </div>

                <Separator
                  className="my-4"
                  style={{ backgroundColor: `${themeSettings.colors.primary}${alphaToHexCode(0.2)}` }}
                />

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold" style={{ color: themeSettings.colors.primary }}>
                    ${order.totalAmount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4" style={{ color: themeSettings.colors.text }} />
            <h3 className="font-semibold mb-2">No Orders Yet</h3>
            <p style={{ color: themeSettings.colors.text }}>
              You haven&apos;t placed any orders yet. Start shopping to see your order history here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
