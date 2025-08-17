import { IEvent, useEditorContext } from "@tribe-nest/frontend-shared";
import React, { useState } from "react";
import { TicketSelection } from "./TicketSelection";
import { BuyerDetails } from "./BuyerDetails";
import { PaymentStep } from "./PaymentStep";
import { SuccessStep } from "./SuccessStep";

type Props = {
  event: IEvent;
};

enum Step {
  Tickets,
  Details,
  Payment,
  Success,
}

type BuyerData = {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
};

export function EventTickets({ event }: Props) {
  const { themeSettings } = useEditorContext();

  const [currentStep, setCurrentStep] = useState<Step>(Step.Tickets);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [buyerData, setBuyerData] = useState<BuyerData>({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
  });

  const totalQuantity = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = event.tickets.reduce((sum, ticket) => {
    const quantity = selectedTickets[ticket.id] || 0;
    return sum + ticket.price * quantity;
  }, 0);

  const totalAmount = event.tickets.reduce((sum, ticket) => {
    const quantity = selectedTickets[ticket.id] || 0;
    return sum + ticket.price * quantity;
  }, 0);

  const handleTicketChange = (ticketId: string, quantity: number) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketId]: quantity,
    }));
  };

  const handleBuyerDataChange = (field: keyof BuyerData, value: string) => {
    setBuyerData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setCurrentStep(Step.Tickets);
    setSelectedTickets({});
    setBuyerData({
      firstName: "",
      lastName: "",
      email: "",
      confirmEmail: "",
    });
  };

  const steps: Step[] = [Step.Tickets, Step.Details, Step.Payment, Step.Success];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="w-full mx-auto pb-50">
      {/* Progress Indicator */}
      {currentStep !== Step.Success && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.slice(0, -1).map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold`}
                    style={{
                      backgroundColor: index <= currentStepIndex ? themeSettings.colors.primary : "transparent",
                      borderColor:
                        index <= currentStepIndex ? themeSettings.colors.primary : themeSettings.colors.primary + "40",
                      color:
                        index <= currentStepIndex ? themeSettings.colors.textPrimary : themeSettings.colors.primary,
                    }}
                  >
                    {index + 1}
                  </div>
                </div>
                {index < steps.length - 2 && (
                  <div
                    className="flex-1 h-0.5 mx-4"
                    style={{
                      backgroundColor:
                        index < currentStepIndex ? themeSettings.colors.primary : themeSettings.colors.primary + "20",
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div>
        {currentStep === Step.Tickets && (
          <TicketSelection
            tickets={event.tickets}
            selectedTickets={selectedTickets}
            onTicketChange={handleTicketChange}
            totalPrice={totalPrice}
            handleNext={() => setCurrentStep(Step.Details)}
            totalQuantity={totalQuantity}
          />
        )}

        {currentStep === Step.Details && (
          <BuyerDetails
            buyerData={buyerData}
            onDataChange={handleBuyerDataChange}
            handleNext={() => setCurrentStep(Step.Payment)}
            handleBack={() => setCurrentStep(Step.Tickets)}
            totalPrice={totalPrice}
          />
        )}

        {currentStep === Step.Payment && (
          <PaymentStep
            totalAmount={totalAmount}
            onNext={() => setCurrentStep(Step.Success)}
            onBack={() => setCurrentStep(Step.Details)}
            buyerData={buyerData}
            selectedTickets={selectedTickets}
            event={event}
          />
        )}

        {currentStep === Step.Success && (
          <SuccessStep
            event={event}
            selectedTickets={selectedTickets}
            buyerData={buyerData}
            totalAmount={totalAmount}
            onStartOver={resetForm}
          />
        )}
      </div>
    </div>
  );
}
