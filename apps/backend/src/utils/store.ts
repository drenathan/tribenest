import { Locale } from "@src/types";
import { AsyncLocalStorage } from "async_hooks";
import { v4 as uuidv4 } from "uuid";

const requestStore = new AsyncLocalStorage();

type RequestKeys =
  | "requestId"
  | "locale"
  | "timezoneOffsetInMinutes"
  | "currentAccountId"
  | "currentCoupleId"
  | "currentFormattedUserDate"
  | "userStartOfDayUTC"
  | "userEndOfDayUTC";

export const createRequestStore = () => {
  const requestId = uuidv4();
  requestStore.enterWith(new Map());
  setRequestProperty("requestId", requestId);
};

export const setRequestProperty = (key: RequestKeys, value: string | number | Date) => {
  const store = requestStore.getStore() as Map<RequestKeys, string | number | Date>;
  store.set(key, value);
};

export const getRequestProperty = (key: RequestKeys) => {
  const store = requestStore.getStore() as Map<RequestKeys, string | number | Date>;
  return store.get(key);
};

export default requestStore;
