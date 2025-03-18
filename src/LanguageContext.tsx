import { createContext, useContext } from "react";
import { CONSTANT_EN, CONSTANT_FR, CONVERT_FILE_EN, CONVERT_FILE_FR } from "./constants";

export type LanguageContextType = "en" | "fr";
export const LanguageContext = createContext<LanguageContextType>("en");

export function useLanguage() {
  const lang = useContext(LanguageContext);
  return lang === "en" ? CONSTANT.en : CONSTANT.fr;
}

const CONSTANT = {
  fr: { ...CONSTANT_FR, ...CONVERT_FILE_FR },
  en: { ...CONSTANT_EN, ...CONVERT_FILE_EN },
};
