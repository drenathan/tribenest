/**
 * Safe JSON stringify that handles BigInt values
 * @param obj - The object to stringify
 * @returns JSON string with BigInt values converted to strings
 */
export const safeStringify = (obj: any): string => {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  });
};

/**
 * Safe JSON parse that can handle BigInt strings
 * @param json - The JSON string to parse
 * @returns Parsed object
 */
export const safeParse = (json: string): any => {
  return JSON.parse(json);
};
