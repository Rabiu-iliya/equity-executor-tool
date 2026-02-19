import { useCurrency } from "../context/currencyContext";
import { currencies } from "../config/currencies";

const CurrencySelector = () => {
  const { currency, changeCurrency } = useCurrency();

  return (
    <select
      value={currency?.code}
      onChange={(e) => changeCurrency(e.target.value)}
    >
      {Object.entries(currencies).map(([country, data]) => (
        <option key={country} value={country}>
          {data.name} ({data.symbol})
        </option>
      ))}
    </select>
  );
};

export default CurrencySelector;
