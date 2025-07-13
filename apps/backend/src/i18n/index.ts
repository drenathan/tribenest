import "intl-pluralrules";
import i18next from "i18next";
import { getRequestProperty } from "@src/utils/store";
import { Locale } from "@src/types";

export default function i18nInit() {
  i18next.init({
    resources: {
      en: { translation: require("./translation/en.json") },
      de: { translation: require("./translation/de.json") },
    },
    fallbackLng: "en",
  });
}

export const t = (key: string, options = {}, locale = getRequestProperty("locale") as Locale) => {
  if (!i18next.exists(key)) {
    throw new Error(`Translation key ${key} does not exist`);
  }
  return i18next.t(key, { ...options, lng: locale });
};
