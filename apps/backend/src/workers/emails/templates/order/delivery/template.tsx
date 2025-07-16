import * as React from "react";
import { Html, Head, Body, Container, Section, Heading, Text, Button, Hr, Img, Link } from "@react-email/components";

import type { IVariables } from "./index";

export function Template(props: IVariables) {
  const { senderName, recipientMessage, orderId, items, archive, isGift, recipientName, totalAmount, date } = props;

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Html lang="en">
      <Head>
        <title>Your Music is Ready!</title>
      </Head>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Hi {recipientName},</Heading>
            {isGift ? (
              <Text style={giftMessage}>
                🎁 You have received a musical gift from <strong>{senderName}</strong>
              </Text>
            ) : (
              <Text style={giftMessage}>Thank you for your purchase!</Text>
            )}
            {recipientMessage && <Text style={giftMessage}>{recipientMessage}</Text>}
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
            {!isGift && (
              <Text style={text}>
                <strong>Total Amount:</strong> ${totalAmount}
              </Text>
            )}
          </Section>

          {/* Order Items */}
          <Section style={section}>
            <Heading style={h2}>{isGift ? "What You Received" : "What You Ordered"}</Heading>

            {/* Table Header */}
            <div style={tableHeader}>
              <div style={headerRow}>
                <div style={headerCell}>Item</div>
                <div style={headerCell}>Type</div>
                <div style={headerCell}>Quantity</div>
                <div style={headerCell}>Price</div>
              </div>
            </div>

            {/* Table Rows */}
            {items.map((item, index) => (
              <div key={index} style={tableRow}>
                <div style={cell}>
                  <Text style={itemTitle}>{item.title}</Text>
                  {item.isGift && (
                    <Text style={giftInfo}>
                      {item.recipientMessage && <div style={message}>"{item.recipientMessage}"</div>}
                    </Text>
                  )}
                </div>
                <div style={cell}>
                  {item.isGift ? (
                    <span style={giftBadge}>🎁 Gift</span>
                  ) : (
                    <span style={purchaseBadge}>💿 Purchase</span>
                  )}
                </div>
                <div style={cell}>{item.quantity}</div>
                <div style={cell}>${item.price}</div>
              </div>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Download Section */}
          <Section style={section}>
            <Heading style={h2}>Download Your Music</Heading>
            <Text style={text}>
              Your music has been prepared and is ready for download. Click the link below to get your files:
            </Text>

            <Section style={downloadSection}>
              <Text style={archiveTitle}>{archive.filename}</Text>
              <Text style={archiveInfo}>Size: {formatFileSize(archive.size)}</Text>
              <Button style={button} href={archive.url}>
                📥 Download Now
              </Button>
            </Section>
          </Section>

          {/* Instructions */}
          <Section style={section}>
            <Heading style={h2}>How to Use Your Files</Heading>
            <Text style={text}>• Download the ZIP files to your computer</Text>
            <Text style={text}>• Extract the ZIP files using your computer's built-in tools</Text>
            <Text style={text}>• Enjoy your music on any device that supports wav or flac files</Text>
            <Text style={text}>• You can also listen to the music directly on the artist's website</Text>
            <Text style={text}>• You can download the files again anytime</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Thank you for your purchase! If you have any questions, please don't hesitate to contact us.
            </Text>
            <Text style={footerText}>Happy listening! 🎶</Text>
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

const giftInfo = {
  fontSize: "12px",
  color: "#666666",
  margin: "4px 0 0 0",
  fontStyle: "italic",
};

const message = {
  color: "#667eea",
  fontStyle: "italic",
  marginTop: "4px",
};

const giftBadge = {
  backgroundColor: "#ff6b6b",
  color: "#ffffff",
  padding: "4px 8px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "bold",
};

const purchaseBadge = {
  backgroundColor: "#51cf66",
  color: "#ffffff",
  padding: "4px 8px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "bold",
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
