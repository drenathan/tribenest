import * as React from "react";
import { Html, Head, Body, Container, Section, Heading, Text, Button, Hr, Img, Link } from "@react-email/components";

import type { IVariables } from "./index";

export function Template(props: IVariables) {
  const { orderId, items, recipientName, totalAmount, date, event } = props;

  return (
    <Html lang="en">
      <Head>
        <title>Your Tickets are Ready!</title>
      </Head>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Hi {recipientName},</Heading>
            <Text style={giftMessage}>Thank you for your purchase!</Text>
          </Section>

          {/* Event Details */}
          <Section style={section}>
            <Heading style={h2}>Event Details</Heading>
            <Text style={text}>
              <strong>Event:</strong> {event.title}
            </Text>
            <Text style={text}>
              <strong>Date & Time:</strong> {new Date(event.dateTime).toLocaleString()}
            </Text>
            {event.address && (
              <Text style={text}>
                <strong>Location:</strong> {event.address.name}, {event.address.street}, {event.address.city},{" "}
                {event.address.country} {event.address.zipCode}
              </Text>
            )}
          </Section>

          {/* Order Details */}
          <Section style={section}>
            <Heading style={h2}>Order Details</Heading>
            <Text style={text}>
              <strong>Order ID:</strong> {orderId}
            </Text>
            <Text style={text}>
              <strong>Order Date:</strong> {date}
            </Text>
            <Text style={text}>
              <strong>Total Amount:</strong> ${totalAmount}
            </Text>
          </Section>

          {/* Ticket Details */}
          <Section style={section}>
            <Heading style={h2}>Your Tickets</Heading>

            {/* Table Header */}
            <div style={tableHeader}>
              <div style={headerRow}>
                <div style={headerCell}>Ticket Type</div>
                <div style={headerCell}>Quantity</div>
                <div style={headerCell}>Price</div>
                <div style={headerCell}>Ticket ID</div>
              </div>
            </div>

            {/* Table Rows */}
            {items.map((item, index) => (
              <div key={index} style={tableRow}>
                <div style={cell}>
                  <Text style={itemTitle}>{item.title}</Text>
                </div>
                <div style={cell}>{item.quantity}</div>
                <div style={cell}>${item.price}</div>
                <div style={cell}>
                  <Text style={ticketId}>{item.eventTicketId}</Text>
                </div>
              </div>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Instructions */}
          {event.description && (
            <Section style={section}>
              <Heading style={h2}>Event Details</Heading>
              <Text dangerouslySetInnerHTML={{ __html: event.description }} style={text} />
            </Section>
          )}

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>Thank you for your purchase! We hope you enjoy the event.</Text>
            <Text style={footerText}>Have a great time! 🎉</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  width: "100%",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const header = {
  textAlign: "center" as const,
  padding: "40px 0",
  backgroundColor: "#667eea",
  color: "#ffffff",
};

const h1 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const h2 = {
  color: "#333333",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "20px 0",
  padding: "0",
};

const giftMessage = {
  color: "#ffffff",
  fontSize: "16px",
  margin: "10px 0",
  padding: "0",
};

const section = {
  padding: "24px",
};

const text = {
  color: "#333333",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "8px 0",
};

const tableHeader = {
  backgroundColor: "#f8f9fa",
  borderBottom: "2px solid #e9ecef",
  marginBottom: "0",
};

const headerRow = {
  display: "flex",
  padding: "12px 0",
};

const headerCell = {
  flex: "1",
  padding: "0 12px",
  fontSize: "14px",
  fontWeight: "bold",
  color: "#333333",
};

const tableRow = {
  display: "flex",
  borderBottom: "1px solid #e9ecef",
  padding: "12px 0",
};

const cell = {
  flex: "1",
  padding: "0 12px",
  fontSize: "14px",
  color: "#333333",
  verticalAlign: "top" as const,
};

const itemTitle = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#333333",
  margin: "0",
};

const ticketId = {
  fontSize: "12px",
  color: "#666666",
  fontFamily: "monospace",
  margin: "0",
};

const hr = {
  borderColor: "#e9ecef",
  margin: "20px 0",
};

const downloadSection = {
  backgroundColor: "#f8f9fa",
  padding: "20px",
  borderRadius: "8px",
  margin: "20px 0",
  border: "1px solid #e9ecef",
};

const archiveTitle = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333333",
  margin: "0 0 8px 0",
};

const archiveInfo = {
  fontSize: "14px",
  color: "#666666",
  margin: "0 0 16px 0",
};

const button = {
  backgroundColor: "#667eea",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = {
  textAlign: "center" as const,
  padding: "24px",
  backgroundColor: "#f8f9fa",
  borderTop: "1px solid #e9ecef",
};

const footerText = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "8px 0",
};
