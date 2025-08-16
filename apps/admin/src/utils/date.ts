export const formatDateTimeLocale = (dateTime: string) => {
  const date = new Date(dateTime);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
