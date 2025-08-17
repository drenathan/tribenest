import { ITicket, useEditorContext } from "@tribe-nest/frontend-shared";
import React from "react";
import { Actions } from "./Actions";
import { toast } from "sonner";

type Props = {
  tickets: ITicket[];
  selectedTickets: { [ticketId: string]: number };
  onTicketChange: (ticketId: string, quantity: number) => void;
  totalPrice: number;
  handleNext: () => void;
  totalQuantity: number;
};

export function TicketSelection({
  tickets,
  selectedTickets,
  onTicketChange,
  totalPrice,
  handleNext,
  totalQuantity,
}: Props) {
  const { themeSettings } = useEditorContext();

  const incrementTicket = (ticketId: string) => {
    const currentQty = selectedTickets[ticketId] || 0;
    const ticket = tickets.find((t) => t.id === ticketId);
    const remainingQty = ticket!.quantity - ticket!.sold;
    if (ticket && currentQty < remainingQty) {
      onTicketChange(ticketId, currentQty + 1);
    }
  };

  const decrementTicket = (ticketId: string) => {
    const currentQty = selectedTickets[ticketId] || 0;
    if (currentQty > 0) {
      onTicketChange(ticketId, currentQty - 1);
    }
  };

  const handleNextClick = () => {
    if (totalQuantity === 0) {
      toast.error("Please select at least one ticket");
      return;
    }
    handleNext();
  };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6" style={{ color: themeSettings.colors.text }}>
          Select Tickets
        </h2>

        <div className="space-y-4">
          {tickets.map((ticket) => {
            const selectedQty = selectedTickets[ticket.id] || 0;
            const remainingQty = ticket.quantity - ticket.sold;
            const isSoldOut = remainingQty <= 0;

            return (
              <div
                key={ticket.id}
                className="p-4 border-2 bg-opacity-50"
                style={{
                  borderColor: themeSettings.colors.primary + "40",
                  backgroundColor: themeSettings.colors.background,
                  borderRadius: `${themeSettings.cornerRadius}px`,
                  opacity: isSoldOut ? 0.5 : 1,
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: themeSettings.colors.text }}>
                      {ticket.title}
                    </h3>
                    <div className="text-2xl font-bold mb-2" style={{ color: themeSettings.colors.primary }}>
                      ${ticket.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => decrementTicket(ticket.id)}
                      disabled={selectedQty === 0 || isSoldOut}
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xl font-bold disabled:opacity-30 cursor-pointer"
                      style={{
                        borderColor: themeSettings.colors.primary,
                        color: themeSettings.colors.primary,
                        borderRadius: `${themeSettings.cornerRadius}px`,
                      }}
                    >
                      −
                    </button>
                    <span
                      className="text-xl font-bold min-w-[2rem] text-center"
                      style={{ color: themeSettings.colors.text }}
                    >
                      {isSoldOut ? "SOLD OUT" : selectedQty}
                    </span>
                    <button
                      onClick={() => incrementTicket(ticket.id)}
                      disabled={selectedQty >= remainingQty || isSoldOut}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold text-white disabled:opacity-30 cursor-pointer"
                      style={{
                        backgroundColor: themeSettings.colors.primary,
                        borderRadius: `${themeSettings.cornerRadius}px`,
                        color: themeSettings.colors.textPrimary,
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {ticket.description && (
                  <p
                    dangerouslySetInnerHTML={{ __html: ticket.description }}
                    className="mt-3"
                    style={{ color: themeSettings.colors.text }}
                  ></p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Actions totalPrice={totalPrice} canGoBack={false} handleBack={() => {}} handleNext={handleNextClick} />
    </>
  );
}
