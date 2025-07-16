/**
 * Utility functions for masking sensitive configuration values
 */

/**
 * Masks a sensitive string value, showing only the first and last characters
 * @param value - The value to mask
 * @param visibleChars - Number of characters to show at start and end (default: 3)
 * @returns Masked string
 */
export function maskSensitiveValue(value: string | null | undefined, visibleChars: number = 3): string {
  if (!value || value.length === 0) {
    return "";
  }

  if (value.length <= visibleChars * 2) {
    // If the value is too short, just show asterisks
    return "*".repeat(value.length);
  }

  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  const masked = "*".repeat(value.length - visibleChars * 2);

  return `${start}${masked}${end}`;
}

/**
 * Checks if a value is a masked value (contains asterisks)
 * @param value - The value to check
 * @returns True if the value appears to be masked
 */
export function isMaskedValue(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.includes("*");
}

/**
 * Creates a masked configuration object for sensitive fields
 * @param config - The original configuration object
 * @returns Configuration object with sensitive fields masked
 */
export function maskConfiguration(config: any): any {
  if (!config) return config;

  const masked = { ...config };

  // Mask email configuration sensitive fields
  if (masked.smtpPassword) {
    masked.smtpPassword = maskSensitiveValue(masked.smtpPassword);
  }

  // Mask R2 configuration sensitive fields
  if (masked.r2SecretAccessKey) {
    masked.r2SecretAccessKey = maskSensitiveValue(masked.r2SecretAccessKey);
  }

  // Mask payment configuration sensitive fields
  if (masked.paymentProviderPrivateKey) {
    masked.paymentProviderPrivateKey = maskSensitiveValue(masked.paymentProviderPrivateKey);
  }
  if (masked.r2AccessKeyId) {
    masked.r2AccessKeyId = maskSensitiveValue(masked.r2AccessKeyId);
  }

  return masked;
}
