import { createContext, useContext, useState, useEffect } from "react";
import { currencies } from "../config/currencies";
import { detectRegion } from "../utils/detectRegion";

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(null);

  useEffect(() => {
    const savedCurrency = localStorage.getItem("currency");

    if (savedCurrency) {
      setCurrency(JSON.parse(savedCurrency));
    } else {
      const region = detectRegion();
      setCurrency(currencies[region]);
    }
  }, []);

  const changeCurrency = (countryCode) => {
    const selected = currencies[countryCode];
    setCurrency(selected);
    localStorage.setItem("currency", JSON.stringify(selected));
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
