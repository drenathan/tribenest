import { DEFAULT_DATE_FORMAT } from "@src/types";
import { format, sub } from "date-fns";

export const formatDate = (date: string | Date, dateFormat = DEFAULT_DATE_FORMAT) => {
  return format(new Date(date), dateFormat);
};

export const currentDateInUserTimezone = (timezoneOffsetInMinutes: number) => {
  return sub(new Date(), { minutes: timezoneOffsetInMinutes });
};
