export enum ProductCategory {
  Music = "Music",
  Merch = "Merch",
}

export enum ProductDeliveryType {
  Digital = "digital",
  Physical = "physical",
}

export enum OrderStatus {
  InitiatedPayment = "initiated_payment",
  PaymentFailed = "payment_failed",
  Paid = "paid",
  Processing = "processing",
  Shipped = "shipped",
  Delivered = "delivered",
  Cancelled = "cancelled",
}
