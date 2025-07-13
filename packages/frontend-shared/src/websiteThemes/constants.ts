export const alphaToHexCode = (alpha: number) => {
  return Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
};
