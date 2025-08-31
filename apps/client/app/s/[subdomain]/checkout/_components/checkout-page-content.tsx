"use client";
import React, { useEffect, useState } from "react";
import {
  usePublicAuth,
  useCart,
  useEditorContext,
  PaymentProviderName,
  ApiError,
  ProductDeliveryType,
} from "@tribe-nest/frontend-shared";
import { EditorInputWithoutEditor, EditorButtonWithoutEditor } from "@tribe-nest/frontend-shared";
import { useForm, Controller } from "react-hook-form";
import { alphaToHexCode } from "@tribe-nest/frontend-shared";
import { StripeCheckout } from "./stripe-checkout";
import { round } from "lodash";
import { toast } from "sonner";
import InternalPageRenderer from "../../_components/internal-page-renderer";
import { CreditCard, Truck, User } from "lucide-react";

type GuestUserData = {
  firstName: string;
  lastName: string;
  email: string;
};

type ShippingData = {
  address1: string;
  city: string;
  stateCode: string;
  countryCode: string;
  zip: string;
};

export function CheckoutPageContent() {
  return (
    <InternalPageRenderer pagePathname="/checkout">
      <Content />
    </InternalPageRenderer>
  );
}
enum CheckoutStage {
  UserDetails,
  ShippingDetails,
  Payment,
}
type Country = {
  name: string;
  code: string;
  region: string;
  states?: {
    name: string;
    code: string;
  }[];
};

export function Content() {
  const { user } = usePublicAuth();
  const { cartItems } = useCart();
  const { themeSettings, navigate, profile, httpClient } = useEditorContext();
  const [currentStage, setCurrentStage] = useState<CheckoutStage>(CheckoutStage.UserDetails);
  const [guestUserData, setGuestUserData] = useState<GuestUserData | null>(null);
  const [shippingData, setShippingData] = useState<ShippingData>();
  const [isFreeCheckoutLoading, setIsFreeCheckoutLoading] = useState(false);
  const hasPhysicalProduct = cartItems.some((item) => item.deliveryType === ProductDeliveryType.Physical);
  const [shippingCountries, setShippingCountries] = useState<Country[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const subTotal = round(
    cartItems.reduce((cur, item) => cur + item.price * item.quantity, 0),
    2,
  );

  useEffect(() => {
    const fetchShippingCountries = async () => {
      const { data } = await httpClient!.get("/public/products/shipping-countries");
      setShippingCountries(data);
    };
    fetchShippingCountries();
  }, [httpClient]);

  useEffect(() => {
    if (user) {
      if (hasPhysicalProduct) {
        setCurrentStage(CheckoutStage.ShippingDetails);
      } else {
        setCurrentStage(CheckoutStage.Payment);
      }
    } else {
      setCurrentStage(CheckoutStage.UserDetails);
    }
  }, [user, hasPhysicalProduct]);

  const isPaidCheckout = subTotal > 0;

  // Guest user form
  const guestForm = useForm<GuestUserData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  // Shipping form
  const shippingForm = useForm<ShippingData>({
    defaultValues: {
      address1: "",
      city: "",
      stateCode: "",
      countryCode: "",
      zip: "",
    },
  });

  const handleGuestContinue = (data: GuestUserData) => {
    setGuestUserData(data);
    setCurrentStage(hasPhysicalProduct ? CheckoutStage.ShippingDetails : CheckoutStage.Payment);
  };

  const handleShippingContinue = (data: ShippingData) => {
    setShippingData(data);
    setCurrentStage(CheckoutStage.Payment);
  };

  const handleLogin = () => {
    navigate("/login?redirect=/checkout");
  };

  // Watch for country changes to reset state selection
  const selectedCountryCode = shippingForm.watch("countryCode");
  const selectedCountry = shippingCountries.find((country) => country.code === selectedCountryCode);

  useEffect(() => {
    // Reset state when country changes
    if (selectedCountryCode) {
      shippingForm.setValue("stateCode", "");
    }
  }, [selectedCountryCode, shippingForm]);

  const handleFreeCheckout = async () => {
    try {
      setIsFreeCheckoutLoading(true);
      const { data } = await httpClient!.post("/public/orders", {
        amount: subTotal,
        profileId: profile?.id,
        email: guestUserData?.email || user?.email || "",
        firstName: guestUserData?.firstName || user?.firstName || "",
        lastName: guestUserData?.lastName || user?.lastName || "",
        accountId: user?.id,
        cartItems,
        paymentId: "",
        paymentProviderName: PaymentProviderName.Stripe,
        shippingAddress: shippingData,
      });

      navigate(`/checkout/finalise?orderId=${data.orderId}`);
    } catch (error) {
      const message = (error as ApiError).response?.data?.message;
      if (message) {
        toast.error(message);
      }
      console.error(error);
    } finally {
      setIsFreeCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div
        className="w-full max-w-4xl mx-auto p-6"
        style={{
          backgroundColor: themeSettings.colors.background,
          color: themeSettings.colors.text,
          fontFamily: themeSettings.fontFamily,
        }}
      >
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4" style={{ color: themeSettings.colors.text }}>
            Your cart is empty
          </h1>
          <p className="mb-6" style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.7)}` }}>
            Add some items to your cart before checking out.
          </p>
          <EditorButtonWithoutEditor text="Continue Shopping" onClick={() => navigate("/store")} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-6xl mx-auto p-6"
      style={{
        backgroundColor: themeSettings.colors.background,
        color: themeSettings.colors.text,
        fontFamily: themeSettings.fontFamily,
      }}
    >
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div
            className={`flex items-center`}
            style={{
              color:
                currentStage >= CheckoutStage.UserDetails
                  ? themeSettings.colors.primary
                  : `${themeSettings.colors.text}${alphaToHexCode(0.4)}`,
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center border-2"
              style={{
                borderColor:
                  currentStage >= CheckoutStage.UserDetails
                    ? themeSettings.colors.primary
                    : `${themeSettings.colors.text}${alphaToHexCode(0.3)}`,
                backgroundColor:
                  currentStage >= CheckoutStage.UserDetails ? themeSettings.colors.primary : "transparent",
                color:
                  currentStage >= CheckoutStage.UserDetails
                    ? themeSettings.colors.textPrimary
                    : themeSettings.colors.text,
                borderRadius: `${themeSettings.cornerRadius}px`,
              }}
            >
              <User size={16} />
            </div>
            <span className="ml-2">User</span>
          </div>
          {hasPhysicalProduct && (
            <div
              className="w-4 h-0.5"
              style={{ backgroundColor: `${themeSettings.colors.text}${alphaToHexCode(0.3)}` }}
            ></div>
          )}
          {hasPhysicalProduct && (
            <div
              className={`flex items-center`}
              style={{
                color:
                  currentStage >= CheckoutStage.ShippingDetails
                    ? themeSettings.colors.primary
                    : `${themeSettings.colors.text}${alphaToHexCode(0.4)}`,
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                style={{
                  borderColor:
                    currentStage >= CheckoutStage.ShippingDetails
                      ? themeSettings.colors.primary
                      : `${themeSettings.colors.text}${alphaToHexCode(0.3)}`,
                  backgroundColor:
                    currentStage >= CheckoutStage.ShippingDetails ? themeSettings.colors.primary : "transparent",
                  color:
                    currentStage >= CheckoutStage.ShippingDetails
                      ? themeSettings.colors.textPrimary
                      : themeSettings.colors.text,
                  borderRadius: `${themeSettings.cornerRadius}px`,
                }}
              >
                <Truck size={16} />
              </div>
              <span className="ml-2">Shipping</span>
            </div>
          )}
          <div
            className="w-4 h-0.5"
            style={{ backgroundColor: `${themeSettings.colors.text}${alphaToHexCode(0.3)}` }}
          ></div>
          <div
            className={`flex items-center`}
            style={{
              color:
                currentStage >= CheckoutStage.Payment
                  ? themeSettings.colors.primary
                  : `${themeSettings.colors.text}${alphaToHexCode(0.4)}`,
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center border-2"
              style={{
                borderColor:
                  currentStage >= CheckoutStage.Payment
                    ? themeSettings.colors.primary
                    : `${themeSettings.colors.text}${alphaToHexCode(0.3)}`,
                backgroundColor: currentStage >= CheckoutStage.Payment ? themeSettings.colors.primary : "transparent",
                color:
                  currentStage >= CheckoutStage.Payment ? themeSettings.colors.textPrimary : themeSettings.colors.text,
                borderRadius: `${themeSettings.cornerRadius}px`,
              }}
            >
              <CreditCard size={16} />
            </div>
            <span className="ml-2">Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStage === CheckoutStage.UserDetails && !user && (
            <div
              className="rounded-lg shadow-md p-6"
              style={{
                backgroundColor: themeSettings.colors.background,
                border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
                borderRadius: `${themeSettings.cornerRadius}px`,
              }}
            >
              <div
                className="pb-6"
                style={{ borderTop: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.2)}` }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: themeSettings.colors.text }}>
                  Already have an account?
                </h3>
                <EditorButtonWithoutEditor text="Login" onClick={handleLogin} fullWidth />
              </div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: themeSettings.colors.text }}>
                Or
              </h2>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: themeSettings.colors.text }}>
                  Continue as Guest
                </h3>
                <form onSubmit={guestForm.handleSubmit(handleGuestContinue)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: themeSettings.colors.text }}>
                        First Name
                      </label>
                      <Controller
                        control={guestForm.control}
                        name="firstName"
                        rules={{ required: "First name is required" }}
                        render={({ field }) => (
                          <EditorInputWithoutEditor
                            placeholder="First Name"
                            value={field.value}
                            onChange={field.onChange}
                            width="100%"
                          />
                        )}
                      />
                      {guestForm.formState.errors.firstName && (
                        <p className="text-sm text-red-500 mt-1">{guestForm.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: themeSettings.colors.text }}>
                        Last Name
                      </label>
                      <Controller
                        control={guestForm.control}
                        name="lastName"
                        rules={{ required: "Last name is required" }}
                        render={({ field }) => (
                          <EditorInputWithoutEditor
                            placeholder="Last Name"
                            value={field.value}
                            onChange={field.onChange}
                            width="100%"
                          />
                        )}
                      />
                      {guestForm.formState.errors.lastName && (
                        <p className="text-sm text-red-500 mt-1">{guestForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeSettings.colors.text }}>
                      Email
                    </label>
                    <Controller
                      control={guestForm.control}
                      name="email"
                      rules={{
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      }}
                      render={({ field }) => (
                        <EditorInputWithoutEditor
                          placeholder="Email"
                          value={field.value}
                          onChange={field.onChange}
                          width="100%"
                          type="email"
                        />
                      )}
                    />
                    {guestForm.formState.errors.email && (
                      <p className="text-sm text-red-500 mt-1">{guestForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <EditorButtonWithoutEditor text="Continue as Guest" type="submit" fullWidth />
                </form>
              </div>
            </div>
          )}

          {currentStage === CheckoutStage.ShippingDetails && hasPhysicalProduct && (
            <div
              className="rounded-lg shadow-md p-6"
              style={{
                backgroundColor: themeSettings.colors.background,
                border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
                borderRadius: `${themeSettings.cornerRadius}px`,
              }}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: themeSettings.colors.text }}>
                Shipping Details
              </h2>
              <form onSubmit={shippingForm.handleSubmit(handleShippingContinue)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeSettings.colors.text }}>
                    Address Line 1
                  </label>
                  <Controller
                    control={shippingForm.control}
                    name="address1"
                    rules={{ required: "Address is required" }}
                    render={({ field }) => (
                      <EditorInputWithoutEditor
                        placeholder="12 address avenue, Bankstown"
                        value={field.value}
                        onChange={field.onChange}
                        width="100%"
                      />
                    )}
                  />
                  {shippingForm.formState.errors.address1 && (
                    <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.address1.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeSettings.colors.text }}>
                      City
                    </label>
                    <Controller
                      control={shippingForm.control}
                      name="city"
                      rules={{ required: "City is required" }}
                      render={({ field }) => (
                        <EditorInputWithoutEditor
                          placeholder="Sydney"
                          value={field.value}
                          onChange={field.onChange}
                          width="100%"
                        />
                      )}
                    />
                    {shippingForm.formState.errors.city && (
                      <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeSettings.colors.text }}>
                      Postal Code
                    </label>
                    <Controller
                      control={shippingForm.control}
                      name="zip"
                      rules={{ required: "Postal code is required" }}
                      render={({ field }) => (
                        <EditorInputWithoutEditor
                          placeholder="2200"
                          value={field.value}
                          onChange={field.onChange}
                          width="100%"
                        />
                      )}
                    />
                    {shippingForm.formState.errors.zip && (
                      <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.zip.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeSettings.colors.text }}>
                      Country
                    </label>
                    <Controller
                      control={shippingForm.control}
                      name="countryCode"
                      rules={{ required: "Country is required" }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border rounded-md"
                          style={{
                            backgroundColor: themeSettings.colors.background,
                            borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.3)}`,
                            color: themeSettings.colors.text,
                            borderRadius: `${themeSettings.cornerRadius}px`,
                          }}
                        >
                          <option value="">Select Country</option>
                          {shippingCountries.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {shippingForm.formState.errors.countryCode && (
                      <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.countryCode.message}</p>
                    )}
                  </div>

                  {selectedCountry?.states && selectedCountry.states.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: themeSettings.colors.text }}>
                        State/Province
                      </label>
                      <Controller
                        control={shippingForm.control}
                        name="stateCode"
                        rules={{ required: "State/Province is required" }}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full px-3 py-2 border rounded-md"
                            style={{
                              backgroundColor: themeSettings.colors.background,
                              borderColor: `${themeSettings.colors.primary}${alphaToHexCode(0.3)}`,
                              color: themeSettings.colors.text,
                              borderRadius: `${themeSettings.cornerRadius}px`,
                            }}
                          >
                            <option value="">Select State/Province</option>
                            {selectedCountry.states!.map((state) => (
                              <option key={state.code} value={state.code}>
                                {state.name}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {shippingForm.formState.errors.stateCode && (
                        <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.stateCode.message}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <EditorButtonWithoutEditor
                    text="Back"
                    onClick={() => setCurrentStage(CheckoutStage.UserDetails)}
                    variant="secondary"
                    fullWidth={false}
                  />
                  <EditorButtonWithoutEditor text="Continue to Payment" type="submit" fullWidth />
                </div>
              </form>
            </div>
          )}

          {currentStage === CheckoutStage.Payment && isPaidCheckout && (
            <div
              className="rounded-lg shadow-md p-6"
              style={{
                backgroundColor: themeSettings.colors.background,
                border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
                borderRadius: `${themeSettings.cornerRadius}px`,
              }}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: themeSettings.colors.text }}>
                Payment Information
              </h2>
              <StripeCheckout
                amount={subTotal}
                email={guestUserData?.email || user?.email || ""}
                firstName={guestUserData?.firstName}
                lastName={guestUserData?.lastName}
                shippingAddress={shippingData}
                setShippingCost={setShippingCost}
              />
              <div className="h-4" />
              <EditorButtonWithoutEditor
                text="Back"
                variant="secondary"
                onClick={() =>
                  hasPhysicalProduct
                    ? setCurrentStage(CheckoutStage.ShippingDetails)
                    : setCurrentStage(CheckoutStage.UserDetails)
                }
              />
            </div>
          )}
          {currentStage === CheckoutStage.Payment && !isPaidCheckout && (
            <div
              className="rounded-lg shadow-md p-6"
              style={{
                backgroundColor: themeSettings.colors.background,
                border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
                borderRadius: `${themeSettings.cornerRadius}px`,
              }}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: themeSettings.colors.text }}>
                Payment Information
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                This is a free checkout. You will not be charged anything.
              </p>
              <EditorButtonWithoutEditor
                text="Complete Checkout"
                onClick={handleFreeCheckout}
                fullWidth
                disabled={isFreeCheckoutLoading}
              />
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div
            className="rounded-lg shadow-md p-6 sticky top-6"
            style={{
              backgroundColor: themeSettings.colors.background,
              border: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
              borderRadius: `${themeSettings.cornerRadius}px`,
            }}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: themeSettings.colors.text }}>
              Order Summary
            </h3>

            {/* User Info */}
            <div
              className="mb-4 pb-4"
              style={{ borderBottom: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.2)}` }}
            >
              <h4 className="font-semibold mb-2" style={{ color: themeSettings.colors.text }}>
                Customer
              </h4>
              {user ? (
                <div className="text-sm">
                  <p style={{ color: themeSettings.colors.text }}>
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.6)}` }}>{user?.email}</p>
                </div>
              ) : guestUserData ? (
                <div className="text-sm">
                  <p style={{ color: themeSettings.colors.text }}>
                    {guestUserData.firstName} {guestUserData.lastName}
                  </p>
                  <p style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.6)}` }}>{guestUserData.email}</p>
                </div>
              ) : (
                <p className="text-sm" style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.5)}` }}>
                  Guest checkout
                </p>
              )}
            </div>

            {/* Shipping Info */}
            {hasPhysicalProduct && shippingData && (
              <div
                className="mb-4 pb-4"
                style={{ borderBottom: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.2)}` }}
              >
                <h4 className="font-semibold mb-2" style={{ color: themeSettings.colors.text }}>
                  Shipping Address
                </h4>
                <div className="text-sm">
                  <p style={{ color: themeSettings.colors.text }}>{shippingData.address1}</p>
                  <p style={{ color: themeSettings.colors.text }}>
                    {shippingData.city}, {shippingData.stateCode} {shippingData.zip}
                  </p>
                  <p style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.6)}` }}>
                    {shippingCountries.find((c) => c.code === shippingData.countryCode)?.name}
                  </p>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div
              className="mb-4 pb-4"
              style={{ borderBottom: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.2)}` }}
            >
              <h4 className="font-semibold mb-2" style={{ color: themeSettings.colors.text }}>
                Items
              </h4>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.productVariantId}-${item.isGift}-${item.recipientEmail}`}
                    className="flex justify-between text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: themeSettings.colors.text }}>
                        {item.title}
                      </p>
                      {item.isGift && (
                        <p className="text-xs" style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.6)}` }}>
                          Gift for {item.recipientName}
                        </p>
                      )}
                      <p className="text-xs" style={{ color: `${themeSettings.colors.text}${alphaToHexCode(0.6)}` }}>
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium" style={{ color: themeSettings.colors.text }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span style={{ color: themeSettings.colors.text }}>Subtotal</span>
                <span style={{ color: themeSettings.colors.text }}>${subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: themeSettings.colors.text }}>Shipping </span>
                <span style={{ color: themeSettings.colors.text }}>${shippingCost.toFixed(2)}</span>
              </div>
              <div
                className="flex justify-between font-bold text-lg pt-2"
                style={{
                  borderTop: `1px solid ${themeSettings.colors.primary}${alphaToHexCode(0.2)}`,
                  color: themeSettings.colors.primary,
                }}
              >
                <span>Total</span>
                <span>${(subTotal + shippingCost).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
