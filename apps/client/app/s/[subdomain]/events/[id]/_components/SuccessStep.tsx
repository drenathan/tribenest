import { IEvent, ITicket, useEditorContext } from "@tribe-nest/frontend-shared";
import React from "react";

type Props = {
  event: IEvent;
  selectedTickets: { [ticketId: string]: number };
  buyerData: {
    firstName: string;
    lastName: string;
    email: string;
    confirmEmail: string;
  };
  totalAmount: number;
  onStartOver: () => void;
};

export function SuccessStep({ event, selectedTickets, buyerData, totalAmount, onStartOver }: Props) {
  const { themeSettings } = useEditorContext();

  const orderId = `TN-${Date.now().toString().slice(-8)}`;
  const orderDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#10b981" }}
        >
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold" style={{ color: themeSettings.colors.text }}>
          Purchase Successful!
        </h2>

        <p className="text-lg" style={{ color: themeSettings.colors.text + "80" }}>
          Thank you for your purchase. Your tickets have been confirmed.
        </p>
      </div>

      {/* Order Details */}
      <div
        className="p-6 border-2"
        style={{
          borderColor: themeSettings.colors.primary + "40",
          backgroundColor: themeSettings.colors.background,
          borderRadius: `${themeSettings.cornerRadius}px`,
        }}
      >
        <h3 className="text-xl font-semibold mb-4" style={{ color: themeSettings.colors.text }}>
          Order Confirmation
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span style={{ color: themeSettings.colors.text + "80" }}>Order ID:</span>
            <span className="font-semibold" style={{ color: themeSettings.colors.text }}>
              {orderId}
            </span>
          </div>

          <div className="flex justify-between">
            <span style={{ color: themeSettings.colors.text + "80" }}>Order Date:</span>
            <span className="font-semibold" style={{ color: themeSettings.colors.text }}>
              {orderDate}
            </span>
          </div>

          <div className="flex justify-between">
            <span style={{ color: themeSettings.colors.text + "80" }}>Total Tickets:</span>
            <span className="font-semibold" style={{ color: themeSettings.colors.text }}>
              {totalTickets}
            </span>
          </div>

          <div className="flex justify-between text-lg">
            <span className="font-semibold" style={{ color: themeSettings.colors.text }}>
              Total Amount:
            </span>
            <span className="font-bold" style={{ color: themeSettings.colors.primary }}>
              €{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div
        className="p-6 border-2"
        style={{
          borderColor: themeSettings.colors.primary + "40",
          backgroundColor: themeSettings.colors.background,
          borderRadius: `${themeSettings.cornerRadius}px`,
        }}
      >
        <h3 className="text-xl font-semibold mb-4" style={{ color: themeSettings.colors.text }}>
          Event Details
        </h3>

        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-lg" style={{ color: themeSettings.colors.text }}>
              {event.title}
            </h4>
          </div>

          <div>
            <span style={{ color: themeSettings.colors.text + "80" }}>Date & Time: </span>
            <span className="font-medium" style={{ color: themeSettings.colors.text }}>
              {new Date(event.dateTime).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div>
            <span style={{ color: themeSettings.colors.text + "80" }}>Location: </span>
            <span className="font-medium" style={{ color: themeSettings.colors.text }}>
              {event.address.name}, {event.address.street}, {event.address.city}, {event.address.country}
            </span>
          </div>
        </div>
      </div>

      {/* Buyer Information */}
      <div
        className="p-6 border-2"
        style={{
          borderColor: themeSettings.colors.primary + "40",
          backgroundColor: themeSettings.colors.background,
          borderRadius: `${themeSettings.cornerRadius}px`,
        }}
      >
        <h3 className="text-xl font-semibold mb-4" style={{ color: themeSettings.colors.text }}>
          Ticket Holder Information
        </h3>

        <div className="space-y-2">
          <div>
            <span style={{ color: themeSettings.colors.text + "80" }}>Name: </span>
            <span className="font-medium" style={{ color: themeSettings.colors.text }}>
              {buyerData.firstName} {buyerData.lastName}
            </span>
          </div>

          <div>
            <span style={{ color: themeSettings.colors.text + "80" }}>Email: </span>
            <span className="font-medium" style={{ color: themeSettings.colors.text }}>
              {buyerData.email}
            </span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div
        className="p-6 border-2"
        style={{
          borderColor: "#06b6d4" + "40",
          backgroundColor: "#06b6d4" + "10",
          borderRadius: `${themeSettings.cornerRadius}px`,
        }}
      >
        <h3 className="text-lg font-semibold mb-3" style={{ color: themeSettings.colors.text }}>
          📧 What's Next?
        </h3>

        <ul className="space-y-2 text-sm" style={{ color: themeSettings.colors.text + "90" }}>
          <li>• A confirmation email will be sent to {buyerData.email}</li>
          <li>• Your tickets will be attached as PDF files</li>
          <li>• Please arrive 30 minutes before the event starts</li>
          <li>• Present your tickets (digital or printed) at the entrance</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        <button
          onClick={onStartOver}
          className="w-full py-3 px-6 font-semibold text-lg border-2"
          style={{
            color: themeSettings.colors.primary,
            borderColor: themeSettings.colors.primary,
            backgroundColor: "transparent",
            borderRadius: `${themeSettings.cornerRadius}px`,
          }}
        >
          Purchase More Tickets
        </button>
      </div>
    </div>
  );
}
