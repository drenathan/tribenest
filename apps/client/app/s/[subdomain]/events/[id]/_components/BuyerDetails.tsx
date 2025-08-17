import { EditorInputWithoutEditor, useEditorContext } from "@tribe-nest/frontend-shared";
import React from "react";
import { Actions } from "./Actions";
import { toast } from "sonner";
import { z } from "zod";

type Props = {
  buyerData: {
    firstName: string;
    lastName: string;
    email: string;
    confirmEmail: string;
  };
  onDataChange: (field: keyof Props["buyerData"], value: string) => void;
  handleNext: () => void;
  handleBack: () => void;
  totalPrice: number;
};
const emailSchema = z.string().email();

export function BuyerDetails({ buyerData, onDataChange, handleNext, handleBack, totalPrice }: Props) {
  const { themeSettings } = useEditorContext();

  const isFormValid = () => {
    if (buyerData.firstName.trim() === "" || buyerData.lastName.trim() === "") {
      toast.error("Please enter your name");
      return false;
    }
    const result = emailSchema.safeParse(buyerData.email);
    if (!result.success) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (buyerData.email !== buyerData.confirmEmail) {
      toast.error("Emails do not match");
      return false;
    }
    return true;
  };

  const handleNextClick = () => {
    if (!isFormValid()) {
      return;
    }
    handleNext();
  };

  return (
    <>
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: themeSettings.colors.text }}>
            Contact Information
          </h2>
          <p className="text-sm" style={{ color: themeSettings.colors.text + "80" }}>
            Please provide your contact information for the tickets.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: themeSettings.colors.text }}>
                First Name *
              </label>
              <EditorInputWithoutEditor
                placeholder="Enter your first name"
                value={buyerData.firstName}
                onChange={(value) => onDataChange("firstName", value)}
                width="100%"
                widthMobile="100%"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: themeSettings.colors.text }}>
                Last Name *
              </label>
              <EditorInputWithoutEditor
                placeholder="Enter your last name"
                value={buyerData.lastName}
                onChange={(value) => onDataChange("lastName", value)}
                width="100%"
                widthMobile="100%"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeSettings.colors.text }}>
              Email Address *
            </label>
            <EditorInputWithoutEditor
              placeholder="Enter your email address"
              value={buyerData.email}
              onChange={(value) => onDataChange("email", value)}
              type="email"
              width="100%"
              widthMobile="100%"
            />
            {buyerData.email && !emailSchema.safeParse(buyerData.email).success && (
              <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
                Please enter a valid email address
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeSettings.colors.text }}>
              Confirm Email Address *
            </label>
            <EditorInputWithoutEditor
              placeholder="Confirm your email address"
              value={buyerData.confirmEmail}
              onChange={(value) => onDataChange("confirmEmail", value)}
              type="email"
              width="100%"
              widthMobile="100%"
            />
            {buyerData.confirmEmail && buyerData.email !== buyerData.confirmEmail && (
              <p className="text-sm mt-1" style={{ color: "#ef4444" }}>
                Email addresses do not match
              </p>
            )}
          </div>
        </div>

        <div className="text-xs mt-4" style={{ color: themeSettings.colors.text + "60" }}>
          <p>
            By continuing, you agree to receive order confirmations and important updates about your tickets via email.
          </p>
        </div>
      </div>
      <Actions totalPrice={totalPrice} canGoBack={true} handleBack={handleBack} handleNext={handleNextClick} />
    </>
  );
}
